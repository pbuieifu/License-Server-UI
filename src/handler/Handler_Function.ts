import { Data_Component_Generic } from "../components/Component_Generic";
import { Payload_API_Answer } from "./Handler_API";
import { Payload_Error } from "./Handler_Error";
import Handler_Event, { Key_Events } from "./Handler_Event";

type Map_Function = {
  [key: string]: any;
};

type Key_Function_Types = "mount" | "unmount" | "on_click";

export type Payload_Function = (payload?: Payload_Function_Data) => any;

export interface Payload_Result {
  key_event_subscription: [Key_Events, string];
  data: any;
}

interface Payload_Function_Data {
  handler_event: Handler_Event;
  key_call: string;
  data?: any;
  setResults?: (data: any) => void;
}

export default class Handler_Function {
  private handler_event: Handler_Event;
  private component_data: Data_Component_Generic;

  public constructor(
    handler_event: Handler_Event,
    component_data: Data_Component_Generic
  ) {
    this.handler_event = handler_event;
    this.component_data = component_data;
  }

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }

  private getFunction(key: string): Payload_Function {
    const keys = key.split(".");
    let current: Map_Function = map_function;

    for (const key of keys) {
      if (current[key] === undefined) {
        this.notifyError({
          status_code: 404,
          description: `Requested Function ${key} in ${this.component_data.key_component} not found.`,
        });
        return () => {
          console.log(`Function: ${key} was not properly set up.`);
        };
      }
      current = current[key];
    }

    return current as Payload_Function;
  }

  private cleanResults(payload: Payload_Function_Data, data: Payload_Result) {
    if (payload.setResults) {
      payload.setResults((results_prev: Payload_Result[]) => {
        // Find all items matching the first key of key_event_subscription
        const matchedItems = results_prev.filter(
          (result) =>
            result.key_event_subscription[0] === data.key_event_subscription[0]
        );

        // Find the specific item in the matchedItems array that also matches the second key
        const specificItemIndex = matchedItems.findIndex(
          (item) => item.key_event_subscription[1] === payload.key_call
        );

        // If an item with the specific key exists, update its data
        if (specificItemIndex !== -1) {
          matchedItems[specificItemIndex].data = data.data;
        } else {
          // If no specific item exists, add a new one with the data
          matchedItems.push({
            key_event_subscription: [
              data.key_event_subscription[0],
              payload.key_call,
            ],
            data: data.data,
          });
        }

        // Reconstruct the results_prev array to include the updated matchedItems
        // and items not affected by the current operation
        const updatedResults = results_prev
          .filter(
            (result) =>
              result.key_event_subscription[0] !==
              data.key_event_subscription[0]
          )
          .concat(matchedItems);

        return updatedResults;
      });
    }
  }

  public extractDataFromResult(
    key_event: string,
    key_call: string,
    results: Payload_Result[]
  ): any {
    if (results) {
      const filteredByKeyEvent = results.filter(
        (result) => result.key_event_subscription[0] === key_event
      );

      const resultWithKeyCall = filteredByKeyEvent.find(
        (result) => result.key_event_subscription[1] === key_call
      );

      return resultWithKeyCall;
    }
  }

  private generateMounts(
    keys_function: string[],
    payload: Payload_Function_Data
  ): Payload_Function[] {
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);

      let payload_function_data: Payload_Function_Data = {
        handler_event: payload.handler_event,
        key_call: payload.key_call,
      };

      if (payload.setResults)
        payload_function_data.setResults = (data: Payload_Result) => {
          this.cleanResults(payload, data);
        };

      func(payload_function_data);
    });

    return [];
  }

  private generateUnmounts(
    keys_function: string[],
    payload: Payload_Function_Data
  ): Payload_Function[] {
    let functions: Payload_Function[] = [];
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);
      let payload_function_data: Payload_Function_Data = {
        handler_event: payload.handler_event,
        key_call: payload.key_call,
      };

      if (payload.setResults)
        payload_function_data.setResults = (data: Payload_Result) => {
          this.cleanResults(payload, data);
        };

      functions.push(func);
    });

    return functions;
  }

  private generateOnClicks(keys_function: string[]): Payload_Function[] {
    let functions: Payload_Function[] = [];
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);
      functions.push(func);
    });

    return functions;
  }

  public generateFunctions(
    key: Key_Function_Types,
    payload?: Payload_Function_Data
  ): Payload_Function[] {
    if (this.component_data.content.functions)
      switch (key) {
        case "mount":
          if (this.component_data.content.functions.mount && payload)
            return this.generateMounts(
              this.component_data.content.functions.mount,
              payload
            );
          break;
        case "unmount":
          if (this.component_data.content.functions.unmount && payload)
            return this.generateUnmounts(
              this.component_data.content.functions.unmount,
              payload
            );

          break;
        case "on_click":
          if (this.component_data.content.functions.on_click)
            return this.generateOnClicks(
              this.component_data.content.functions.on_click
            );
          break;
        default:
          this.notifyError({
            status_code: 404,
            description: `Requested function ${this.component_data.key_component}, ${key} in ${this.component_data.key_component} not found.`,
          });
          break;
      }

    return [];
  }
}

const map_function: Map_Function = {
  function: {
    testing: {
      log: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe("test_log", (data: string) => {
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: ["test_log"],
                  data: data,
                });
            });
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe("test_log", (data: string) => {
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: ["test_log"],
                  data: data,
                });
            });
        },
        publish: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("test_log", payload.data);
        },
      },
      api: {
        publish: (payload: Payload_Function_Data) => {
          console.log("puhlibhsing");
          if (payload.handler_event)
            payload.handler_event.publish("api_call", {
              key_api: "test",
              key_call: payload.key_call,
            });
        },
      },
    },
    navigation: {
      page: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe(
              "page_navigation",
              (data: string) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["page_navigation"],
                    data: data,
                  });
              }
            );
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe(
              "page_navigation",
              (data: string) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["page_navigation"],
                    data: data,
                  });
              }
            );
        },
        publish_home: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("page_navigation", "Home");
        },
        publish_dashboard: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("page_navigation", "Dashboard");
        },
      },
    },
    environment: {
      subscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.subscribe(
            "environment_answer",
            (data: string) => {
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: [payload.key_call],
                  data: data,
                });
            }
          );
      },
      unsubscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.unsubscribe(
            "environment_answer",
            (data: string) => {
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: [payload.key_call],
                  data: data,
                });
            }
          );
      },
    },
    dashboard: {
      api: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe(
              "api_answer",
              (data: Payload_API_Answer) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["api_answer", data.key_call],
                    data: data.data,
                  });
              }
            );
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe(
              "api_answer",
              (data: Payload_API_Answer) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["api_answer", data.key_call],
                    data: data.data,
                  });
              }
            );
        },
        publish: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("api_call", {
              key_api: "dashboard",
              key_call: payload.key_call,
            });
        },
      },
      preferences: {},
    },
  },
};
