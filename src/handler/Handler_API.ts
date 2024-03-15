import { parseLocalStorageItem } from "../helper/Local_Storage";
import { stringToBoolean } from "../helper/stringToBoolean";
import Handler_Environment from "./Handler_Environment";
import { Payload_Error } from "./Handler_Error";
import Handler_Event from "./Handler_Event";

interface Status {
  [key: string]: number;
}

export default class Handler_API {
  private static instance: Handler_API;
  private handler_event: Handler_Event;
  private environment: any;
  private status_codes: Status = {
    success: 0,
    not_found: 3,
    denied: 5,
  };

  private accessCodeRenewalPromise: Promise<void> | null = null;

  private constructor(handler_event: Handler_Event) {
    this.handler_event = handler_event;
  }

  public static getInstance(handler_event?: Handler_Event): Handler_API {
    if (!Handler_API.instance && handler_event) {
      Handler_API.instance = new Handler_API(handler_event);
    }

    return Handler_API.instance;
  }

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }
}
