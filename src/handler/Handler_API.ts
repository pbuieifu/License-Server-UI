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
          { key_column: "client", enabled: true },
          { key_column: "product", enabled: true },
          { key_column: "product_version", enabled: true },
          { key_column: "module", enabled: true },
          { key_column: "component", enabled: true },
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
        id: "1",
        client: "client_data_14",
        product: "product_data_27",
        product_version: "product_version_data_70",
        module: "module_data_15",
        component: "component_data_98",
        status: "status_data_80",
        time_left: "25",
        action_required: true,
      },
      {
        id: "2",
        client: "client_data_64",
        product: "product_data_76",
        product_version: "product_version_data_93",
        module: "module_data_15",
        component: "component_data_61",
        status: "status_data_47",
        time_left: "26",
        action_required: true,
      },
      {
        id: "3",
        client: "client_data_24",
        product: "product_data_8",
        product_version: "product_version_data_55",
        module: "module_data_60",
        component: "component_data_81",
        status: "status_data_80",
        time_left: "27",
        action_required: false,
      },
      {
        id: "4",
        client: "client_data_40",
        product: "product_data_93",
        product_version: "product_version_data_17",
        module: "module_data_63",
        component: "component_data_99",
        status: "status_data_21",
        time_left: "28",
        action_required: false,
      },
      {
        id: "5",
        client: "client_data_15",
        product: "product_data_25",
        product_version: "product_version_data_35",
        module: "module_data_45",
        component: "component_data_55",
        status: "status_data_65",
        time_left: "34",
        action_required: true,
      },
      {
        id: "6",
        client: "client_data_16",
        product: "product_data_26",
        product_version: "product_version_data_36",
        module: "module_data_46",
        component: "component_data_56",
        status: "status_data_66",
        time_left: "35",
        action_required: false,
      },
      {
        id: "7",
        client: "client_data_17",
        product: "product_data_27",
        product_version: "product_version_data_37",
        module: "module_data_47",
        component: "component_data_57",
        status: "status_data_67",
        time_left: "36",
        action_required: true,
      },
      {
        id: "8",
        client: "client_data_18",
        product: "product_data_28",
        product_version: "product_version_data_38",
        module: "module_data_48",
        component: "component_data_58",
        status: "status_data_68",
        time_left: "37",
        action_required: false,
      },
      {
        id: "9",
        client: "client_data_19",
        product: "product_data_29",
        product_version: "product_version_data_39",
        module: "module_data_49",
        component: "component_data_59",
        status: "status_data_69",
        time_left: "38",
        action_required: true,
      },
      {
        id: "10",
        client: "client_data_20",
        product: "product_data_30",
        product_version: "product_version_data_40",
        module: "module_data_50",
        component: "component_data_60",
        status: "status_data_70",
        time_left: "39",
        action_required: false,
      },
      {
        id: "11",
        client: "client_data_21",
        product: "product_data_31",
        product_version: "product_version_data_41",
        module: "module_data_51",
        component: "component_data_61",
        status: "status_data_71",
        time_left: "40",
        action_required: true,
      },
      {
        id: "12",
        client: "client_data_22",
        product: "product_data_32",
        product_version: "product_version_data_42",
        module: "module_data_52",
        component: "component_data_62",
        status: "status_data_72",
        time_left: "41",
        action_required: false,
      },
      {
        id: "13",
        client: "client_data_23",
        product: "product_data_33",
        product_version: "product_version_data_43",
        module: "module_data_53",
        component: "component_data_63",
        status: "status_data_73",
        time_left: "42",
        action_required: true,
      },
      {
        id: "14",
        client: "client_data_24",
        product: "product_data_34",
        product_version: "product_version_data_44",
        module: "module_data_54",
        component: "component_data_64",
        status: "status_data_74",
        time_left: "43",
        action_required: false,
      },
      {
        id: "15",
        client: "client_data_25",
        product: "product_data_35",
        product_version: "product_version_data_45",
        module: "module_data_55",
        component: "component_data_65",
        status: "status_data_75",
        time_left: "44",
        action_required: true,
      },
      {
        id: "16",
        client: "client_data_26",
        product: "product_data_36",
        product_version: "product_version_data_46",
        module: "module_data_56",
        component: "component_data_66",
        status: "status_data_76",
        time_left: "45",
        action_required: false,
      },
      {
        id: "17",
        client: "client_data_27",
        product: "product_data_37",
        product_version: "product_version_data_47",
        module: "module_data_57",
        component: "component_data_67",
        status: "status_data_77",
        time_left: "46",
        action_required: true,
      },
      {
        id: "18",
        client: "client_data_28",
        product: "product_data_38",
        product_version: "product_version_data_48",
        module: "module_data_58",
        component: "component_data_68",
        status: "status_data_78",
        time_left: "47",
        action_required: false,
      },
      {
        id: "19",
        client: "client_data_29",
        product: "product_data_39",
        product_version: "product_version_data_49",
        module: "module_data_59",
        component: "component_data_69",
        status: "status_data_79",
        time_left: "48",
        action_required: true,
      },
      {
        id: "20",
        client: "client_data_30",
        product: "product_data_40",
        product_version: "product_version_data_50",
        module: "module_data_60",
        component: "component_data_70",
        status: "status_data_80",
        time_left: "49",
        action_required: false,
      },
      {
        id: "21",
        client: "client_data_31",
        product: "product_data_41",
        product_version: "product_version_data_51",
        module: "module_data_61",
        component: "component_data_71",
        status: "status_data_81",
        time_left: "50",
        action_required: true,
      },
      {
        id: "22",
        client: "client_data_32",
        product: "product_data_42",
        product_version: "product_version_data_52",
        module: "module_data_62",
        component: "component_data_72",
        status: "status_data_82",
        time_left: "51",
        action_required: false,
      },
      {
        id: "23",
        client: "client_data_33",
        product: "product_data_43",
        product_version: "product_version_data_53",
        module: "module_data_63",
        component: "component_data_73",
        status: "status_data_83",
        time_left: "52",
        action_required: true,
      },
      {
        id: "24",
        client: "client_data_34",
        product: "product_data_44",
        product_version: "product_version_data_54",
        module: "module_data_64",
        component: "component_data_74",
        status: "status_data_84",
        time_left: "53",
        action_required: false,
      },
    ];

    this.newAnswer(payload, answer);
  }
}
