import { Payload_Error } from "./Handler_Error";
import Handler_Event from "./Handler_Event";

interface Payload_Environment {
  path: string[];
  key_environment?: string;
}

interface Payload_Environment_Sanitized extends Payload_Environment {
  fallback: any;
}

interface Payload_Environment_Call
  extends Payload_Environment_Sanitized,
    Payload_Environment_Answer {
  key_call: any;
}

export interface Payload_Environment_Answer {
  key_call: any;
  answer: any;
}

export default class Handler_Environment {
  private static instance: Handler_Environment;
  private environment: any;
  private handler_event: Handler_Event;

  private constructor(handler_event: Handler_Event) {
    this.handler_event = handler_event;
  }

  public static getInstance(
    handler_event?: Handler_Event
  ): Handler_Environment {
    if (!Handler_Environment.instance && handler_event) {
      Handler_Environment.instance = new Handler_Environment(handler_event);
    }

    return Handler_Environment.instance;
  }

  // Since constructors can't be async, use a static initialization method
  public static async initialize(environment_path: string): Promise<boolean> {
    const handler_environment = Handler_Environment.getInstance();
    try {
      const response = await fetch(environment_path);
      const response_json = await response.json();
      handler_environment.environment = response_json;
      handler_environment.handler_event.subscribe(
        "environment_call",
        (payload: Payload_Environment_Call) => {
          const answer = handler_environment.sanitizedObjectLookUp({
            fallback: payload.fallback,
            path: payload.path,
            key_environment: payload.key_environment,
          });
          handler_environment.handler_event.publish("environment_answer", {
            key_call: payload.key_call,
            data: answer,
          });
        }
      );

      return true;
    } catch {
      // Use Error_Handler to notify about the initialization error
      handler_environment.notifyError({
        status_code: 500,
        description: `Initialization failed.`,
      });
      return false;
    }
  }

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }

  public sanitizedObjectLookUp(payload: Payload_Environment_Sanitized) {
    const result = this.objectLookUp({
      path: payload.path,
      key_environment: payload.key_environment,
    });

    if (result === undefined) {
      // Notify using Error_Handler
      this.notifyError({
        status_code: 404,
        description: `Requested object at ${payload.path}, ${payload.key_environment} not found; Fallback used.`,
      });
      return payload.fallback;
    } else {
      return result;
    }
  }

  private objectLookUp(payload: Payload_Environment): any {
    // Traverse the JSON object using the path
    let env = this.environment;

    for (const part of payload.path) {
      if (env && env[part]) {
        env = env[part];
      } else {
        // Path not found
        return undefined;
      }
    }

    if (Array.isArray(env) && payload.key_environment) {
      // Search through the array for an object with the specific key-value pair
      const foundObject = env.find((obj) =>
        Object.keys(obj).some(
          (env_key) =>
            env_key.endsWith("_key") && obj[env_key] === payload.key_environment
        )
      );
      return foundObject ? foundObject : undefined;
    } else {
      return env;
    }
  }
}
