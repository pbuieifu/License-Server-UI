import { parseLocalStorageItem } from "../helper/Local_Storage";
import { stringToBoolean } from "../helper/stringToBoolean";
import { Payload_Error } from "./Handler_Error";
import Handler_Event from "./Handler_Event";

type Key_API_Types =
  | "preferences"
  | "dashboard_licenses"
  | "dashboard_product"
  | "test";

interface Payload_API_Answer {
  Data: any;
  Status: {
    Code: number;
    Message: string;
  };
}

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
    dashboard_licenses: this.getLicenses,
    dashboard_product: this.getProduct,
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
    const answer: Payload_API_Answer = {
      Data: {
        theme: "light_theme",
        dashboard: {
          columns: [
            { key_column: "license_key", enabled: true },
            { key_column: "client_name", enabled: true },
            { key_column: "product_name", enabled: true },
            { key_column: "status", enabled: true },
            { key_column: "action_required", enabled: true },
          ],
        },
      },
      Status: {
        Code: 0,
        Message: "Success",
      },
    };

    this.newAnswer(payload, answer.Data);
  }

  private getLicenses(payload: Payload_API_Call) {
    const answer: Payload_API_Answer = {
      Data: [
        {
          ClientName: "Umbrella Corp",
          ProductName: "HyperDrive",
          License: "27BSVU54",
          MaxDeployments: 25,
          CurrentDeployments: 13,
          Enabled: true,
          AgreementAccepted: true,
          Expired: false,
          InGracePeriod: true,
        },
        {
          ClientName: "Acme Corporation",
          ProductName: "HyperDrive",
          License: "DZRNU4Q1",
          MaxDeployments: 10,
          CurrentDeployments: 8,
          Enabled: true,
          AgreementAccepted: false,
          Expired: true,
          InGracePeriod: false,
        },
        {
          ClientName: "Globex Inc.",
          ProductName: "SuperWidget",
          License: "1FBJM16B",
          MaxDeployments: 50,
          CurrentDeployments: 3,
          Enabled: false,
          AgreementAccepted: false,
          Expired: false,
          InGracePeriod: false,
        },
        {
          ClientName: "Umbrella Corp",
          ProductName: "SuperWidget",
          License: "I93K5EVB",
          MaxDeployments: 10,
          CurrentDeployments: 10,
          Enabled: false,
          AgreementAccepted: true,
          Expired: true,
          InGracePeriod: true,
        },
        {
          ClientName: "Globex Inc.",
          ProductName: "QuantumAccelerator",
          License: "J8WBWH3I",
          MaxDeployments: 25,
          CurrentDeployments: 10,
          Enabled: true,
          AgreementAccepted: false,
          Expired: true,
          InGracePeriod: false,
        },

        {
          ClientName: "Test Client",
          ProductName: "Test Product",
          License: "EWR2230X",
          MaxDeployments: 15,
          CurrentDeployments: 1,
          Enabled: true,
          AgreementAccepted: true,
          Expired: false,
          InGracePeriod: false,
        },
      ],
      Status: {
        Code: 0,
        Message: "Success",
      },
    };
    this.newAnswer(payload, { key_api: payload.key_api, data: answer.Data });
  }

  private getProduct(payload: Payload_API_Call) {
    const answer: Payload_API_Answer = {
      Data: { test: "hi" },
      Status: {
        Code: 0,
        Message: "Success",
      },
    };

    this.newAnswer(payload, { key_api: payload.key_api, data: answer.Data });
  }
}
