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
            {
              key_column: "status",
              direction: "asc",
              shown: true,
              sorted: true,
            },
            {
              key_column: "license_id",
              direction: "desc",
              shown: true,
              sorted: false,
            },
            {
              key_column: "client_name",
              direction: "desc",
              shown: true,
              sorted: true,
            },
            {
              key_column: "product_name",
              direction: "asc",
              shown: true,
              sorted: false,
            },
            {
              key_column: "action_required",
              shown: true,
              sorted: true,
            },
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
          ClientName: "Alpha Enterprises",
          ProductName: "Alpha Suite",
          ProductVersion: "1.2.0",
          LicenseID: "ALP1234X",
          Enabled: true,
          AgreementAccepted: true,
          ExpirationDate: 0,
          GracePeriod: 5,
        },
        {
          ClientName: "Beta Solutions",
          ProductName: "Beta Tools",
          ProductVersion: "2.5.0",
          LicenseID: "BET5678Y",
          Enabled: false,
          AgreementAccepted: false,
          ExpirationDate: 1711684903,
          GracePeriod: 10,
        },
        {
          ClientName: "Gamma Corp",
          ProductName: "Gamma Platform",
          ProductVersion: "3.8.1",
          LicenseID: "GAM9012Z",
          Enabled: true,
          AgreementAccepted: true,
          ExpirationDate: 1711785004,
          GracePeriod: 3,
        },
        {
          ClientName: "Delta Industries",
          ProductName: "Delta System",
          ProductVersion: "4.4.0",
          LicenseID: "DEL3456W",
          Enabled: false,
          AgreementAccepted: false,
          ExpirationDate: 1711885105,
          GracePeriod: 7,
        },
        {
          ClientName: "Epsilon LLC",
          ProductName: "Epsilon Application",
          ProductVersion: "5.6.3",
          LicenseID: "EPS7890V",
          Enabled: true,
          AgreementAccepted: true,
          ExpirationDate: 1711985206,
          GracePeriod: 2,
        },
        {
          ClientName: "Zeta Inc.",
          ProductName: "Zeta Software",
          ProductVersion: "6.9.4",
          LicenseID: "ZET1234U",
          Enabled: true,
          AgreementAccepted: true,
          ExpirationDate: 1712085307,
          GracePeriod: 6,
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
    if (payload.data) {
      const answer: Payload_API_Answer = {
        Data: { test: "hi" },
        Status: {
          Code: 0,
          Message: "Success",
        },
      };

      this.newAnswer(payload, {
        key_api: payload.key_api,
        data: { license_key: payload.data, data: answer.Data },
      });
    }
  }
}
