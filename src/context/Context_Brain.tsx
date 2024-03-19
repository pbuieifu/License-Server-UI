import {
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Handler_Event from "../handler/Handler_Event";
import Handler_Error from "../handler/Handler_Error";
import Handler_Environment from "../handler/Handler_Environment";
import Handler_API from "../handler/Handler_API";
import Component_Generic, {
  Data_Component_Generic,
} from "../components/Component_Generic";

interface Context_Brain_Value {
  handler_event: Handler_Event;
  handler_error: Handler_Error;
  handler_environment?: Handler_Environment;
  handler_api: Handler_API;
}

interface Payload_Store {
  key_store: string;
  data: any;
}

interface Payload_Retrieve {
  key_retrieve: string;
  key_call: string;
}

interface State {
  [key: string]: any;
}

const Brain = createContext<Context_Brain_Value>({} as Context_Brain_Value);

export const Context_Brain = () => {
  const handler_event = useRef(Handler_Event.getInstance()).current;
  const handler_error = useRef(
    Handler_Error.getInstance(handler_event)
  ).current;
  const handler_environment_instance = useRef(
    Handler_Environment.getInstance(handler_event)
  ).current;
  const handler_api = useRef(Handler_API.getInstance(handler_event)).current;

  const [handler_environment, set_handler_Environment] =
    useState<Handler_Environment>();
  const [ready, setReady] = useState<boolean>(false);
  const [states, setStates] = useState<State>({});
  const [appData, setAppData] = useState<Data_Component_Generic>(
    {} as Data_Component_Generic
  );

  const storeShortTerm = (payload: Payload_Store) => {
    setStates((prevState) => ({
      ...prevState,
      [payload.key_store]: payload.data,
    }));
  };

  const storeLongTerm = (payload: Payload_Store) => {
    localStorage.setItem(payload.key_store, JSON.stringify(payload.data));
  };

  const retrieveData = (payload: Payload_Retrieve) => {
    const stateData = states[payload.key_retrieve];
    if (stateData !== undefined) {
      return stateData;
    }

    const storedData = localStorage.getItem(payload.key_retrieve);
    return {
      data: handler_event.publish("retrieve_answer", {
        key_call: payload.key_call,
        data: storedData ? JSON.parse(storedData) : undefined,
      }),
    };
  };

  const initializeApp = (handler: Handler_Environment) => {
    const data_app = handler.sanitizedObjectLookUp({
      fallback: [],
      path: ["subscriber_content", "app"],
    });

    setAppData(data_app);
  };

  const initializeAPI = (handler: Handler_Environment) => {
    const data_api = handler.sanitizedObjectLookUp({
      fallback: [],
      path: ["api", "secret_key"],
    });

    storeLongTerm({ key_store: "handler_api_secret_key", data: data_api });
  };

  const initializeEnvironment = async () => {
    await Handler_Environment.initialize("environment/Environment.json");
    initializeApp(handler_environment_instance);
    initializeAPI(handler_environment_instance);
    set_handler_Environment(handler_environment_instance);
  };

  const initializeStorage = () => {
    handler_event.subscribe("store_short_term", (payload: Payload_Store) => {
      storeShortTerm(payload);
    });
    handler_event.subscribe("store_long_term", (payload: Payload_Store) => {
      storeLongTerm(payload);
    });
  };

  const initializeRetrieve = () => {
    handler_event.subscribe("retrieve_call", (payload: Payload_Retrieve) => {
      console.log("hi");
      retrieveData(payload);
    });
  };

  const cleanUp = () => {
    handler_event.unsubscribe("store_short_term", (payload: Payload_Store) => {
      storeShortTerm(payload);
    });
    handler_event.unsubscribe("store_long_term", (payload: Payload_Store) => {
      storeLongTerm(payload);
    });
    handler_event.unsubscribe("retrieve_call", (payload: Payload_Retrieve) => {
      retrieveData(payload);
    });
  };

  const initializeContext = async () => {
    console.log(handler_api);
    await initializeEnvironment();
    initializeStorage();
    initializeRetrieve();
    setReady(true);
  };

  useEffect(() => {
    initializeContext();

    return () => {
      cleanUp();
    };
  }, []);

  const contextValue: Context_Brain_Value = {
    handler_event,
    handler_error,
    handler_environment,
    handler_api,
  };

  return ready ? (
    <Brain.Provider value={contextValue}>
      <Component_Generic data={appData} />
    </Brain.Provider>
  ) : null;
};

export const useBrain = () => useContext(Brain);
