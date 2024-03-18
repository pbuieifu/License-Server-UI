import { Payload_API_Dashboard } from "../components/Component_Dashboard";
import { parseLocalStorageItem } from "../helper/Local_Storage";
import { stringToBoolean } from "../helper/stringToBoolean";
import Handler_Environment from "./Handler_Environment";
import { Payload_Error } from "./Handler_Error";
import Handler_Event from "./Handler_Event";

type Key_API_Types = "dashboard";

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
  private environment: any;
  private status_codes: Status = {
    success: 0,
    not_found: 3,
    denied: 5,
  };
  private API_MAP: Record<Key_API_Types, Function> = {
    dashboard: this.getDashboard,
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

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }

  private newCall(api_call: Payload_API_Call) {
    const function_api = this.API_MAP[api_call.key_api as Key_API_Types];

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

  private getDashboard(payload: Payload_API_Call) {
    const answer: Payload_API_Dashboard[] = [
      {
        id: "1",
        client: "client_data_14",
        product: "product_data_27",
        product_version: "product_version_data_70",
        module: "module_data_15",
        component: "component_data_98",
        status: "status_data_80",
        time_left: "41",
        action_required: "action_required_data_79",
      },
      {
        id: "2",
        client: "client_data_64",
        product: "product_data_76",
        product_version: "product_version_data_93",
        module: "module_data_15",
        component: "component_data_61",
        status: "status_data_47",
        time_left: "55",
        action_required: "action_required_data_29",
      },
      {
        id: "3",
        client: "client_data_24",
        product: "product_data_8",
        product_version: "product_version_data_55",
        module: "module_data_60",
        component: "component_data_81",
        status: "status_data_80",
        time_left: "14",
        action_required: "action_required_data_52",
      },
      {
        id: "4",
        client: "client_data_40",
        product: "product_data_93",
        product_version: "product_version_data_17",
        module: "module_data_63",
        component: "component_data_99",
        status: "status_data_21",
        time_left: "38",
        action_required: "action_required_data_82",
      },
    ];

    this.newAnswer(payload, answer);
  }
}
