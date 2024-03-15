import jsonEqual from "../helper/jsonEqual";
import Handler_Event from "./Handler_Event";

export interface Payload_Error {
  status_code: number;
  description: string;
}

export default class Handler_Error {
  private static instance: Handler_Error;
  private error_list: Payload_Error[] = [];
  private handler_event: Handler_Event;

  private constructor(handler_event: Handler_Event) {
    this.handler_event = handler_event;
    this.handler_event.subscribe("error", this.newError.bind(this));
  }

  public static getInstance(handler_event?: Handler_Event): Handler_Error {
    if (!Handler_Error.instance && handler_event) {
      Handler_Error.instance = new Handler_Error(handler_event);
    }

    return Handler_Error.instance;
  }

  private newError(error: Payload_Error) {
    if (!this.containsError(error)) this.error_list.push(error);

    //console.log(error);
  }

  private containsError(error: Payload_Error): boolean {
    return this.error_list.some((error_from_list: Payload_Error) =>
      jsonEqual(error_from_list, error)
    );
  }
}
