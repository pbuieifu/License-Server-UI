import { Payload_API_Dashboard } from "../components/Component_Dashboard";
import { Data_Preferences } from "../components/Component_Preferences";
import { parseLocalStorageItem } from "../helper/Local_Storage";
import { stringToBoolean } from "../helper/stringToBoolean";
import { Payload_Error } from "./Handler_Error";
import Handler_Event from "./Handler_Event";

type Key_API_Types = "preferences" | "dashboard" | "test";

interface Status {
  [key: string]: number;
}

export interface Payload_API_Call {
  key_api: string;
  key_call: string;
  data: any;
}

export default class Handler_API {
  private static instance: Handler_API;
  private handler_event: Handler_Event;
  private secret_key: any;
  private status_codes: Status = {
    success: 0,
    not_found: 3,
    denied: 5,
  };
  private API_Map: Record<Key_API_Types, Function> = {
    preferences: this.getPreferences,
    dashboard: this.getDashboard,
    test: () => {},
  };

  private constructor(handler_event: Handler_Event) {
    this.handler_event = handler_event;
    this.handler_event.subscribe("api_call", (payload: Payload_API_Call) => {
      this.newCall(payload);
    });
  }

  public static getInstance(handler_event?: Handler_Event): Handler_API {
    if (!Handler_API.instance && handler_event) {
      Handler_API.instance = new Handler_API(handler_event);
    }

    return Handler_API.instance;
  }

  public static initialize(secret_key: string) {
    Handler_API.getInstance().secret_key = secret_key;
  }

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }

  private newCall(api_call: Payload_API_Call) {
    const function_api = this.API_Map[api_call.key_api as Key_API_Types];
    if (function_api) {
      function_api.call(this, api_call);
    } else {
      this.notifyError({
        status_code: this.status_codes.not_found,
        description: `API method ${api_call.key_api} not found`,
      });
    }
  }

  private newAnswer(payload: Payload_API_Call, answer: any) {
    this.handler_event.publish("api_answer", {
      key_call: payload.key_call,
      data: answer,
    });
  }

  private getPreferences(payload: Payload_API_Call) {
    const answer: Data_Preferences = {
      theme: "light_theme",
      dashboard: {
        columns: [
          { key_column: "license_key", enabled: true },
          { key_column: "client_name", enabled: true },
          { key_column: "product_name", enabled: true },
          { key_column: "product_version", enabled: true },
          { key_column: "status", enabled: true },
          { key_column: "time_left", enabled: true },
          { key_column: "action_required", enabled: true },
        ],
      },
    };

    this.newAnswer(payload, answer);
  }

  private getDashboard(payload: Payload_API_Call) {
    const answer: Payload_API_Dashboard[] = [
      {
        license_key: "qVXHqKdW",
        client_name: "clien22t",
        product_name: "2product",
        product_version: "2.0.0.3",
        purchase_date: new Date("2024-03-25T12:45:00.000Z"),
        expire_date: new Date("2025-02-23T12:45:00.000Z"),
      },
      {
        license_key: "n5lJ81IW",
        client_name: "client",
        product_name: "product",
        product_version: "2.0.0.0",

        purchase_date: new Date("2024-03-25T12:45:00.000Z"),
        expire_date: new Date("2025-01-24T12:45:00.000Z"),
      },
      {
        license_key: "uTH6sdB2",
        client_name: "client1",
        product_name: "product2",
        product_version: "1.0.0.1",

        purchase_date: new Date("2024-03-25T12:45:00.000Z"),
        expire_date: new Date("2025-02-01T12:45:00.000Z"),
      },
      {
        license_key: "iXtPuz39",
        client_name: "client",
        product_name: "product3",
        product_version: "1.0.4.0",

        purchase_date: new Date(),
        expire_date: new Date(),
      },
      {
        license_key: "T0FAejQG",
        client_name: "client4",
        product_name: "product",
        product_version: "1.0.0.2",

        purchase_date: new Date("2024-03-25T12:45:00.000Z"),
        expire_date: new Date("2025-02-25T12:45:00.000Z"),
      },
    ];
    this.newAnswer(payload, answer);
  }
}
