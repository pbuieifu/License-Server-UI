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

  const handler_environment = useRef(
    Handler_Environment.getInstance(handler_event)
  ).current;
  const [ready, setReady] = useState<boolean>(false);
  const [states, setStates] = useState<State>({});
  const stateRef = useRef<State>(states);
  const [appData, setAppData] = useState<Data_Component_Generic>(
    {} as Data_Component_Generic
  );

  useEffect(() => {
    stateRef.current = states;
  }, [states]);

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
    let returnData;

    const stateData = stateRef.current[payload.key_retrieve];
    if (stateData !== undefined) {
      returnData = stateData;
    } else {
      const storedData = localStorage.getItem(payload.key_retrieve);
      returnData = storedData ? JSON.parse(storedData) : undefined;
    }

    handler_event.publish("retrieve_answer", {
      key_call: payload.key_call,
      data: returnData,
    });
  };

  const initializeEnvironment = async () => {
    await Handler_Environment.initialize("configuration/Environment.json");
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

    Handler_API.initialize(data_api);
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
    await initializeEnvironment();
    initializeAPI(handler_environment_instance);
    initializeApp(handler_environment_instance);
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
      <link
        rel="stylesheet"
        type="text/css"
        href="configuration/Environment.css"
      />
      <Component_Generic data={appData} />
    </Brain.Provider>
  ) : null;
};

export const useBrain = () => useContext(Brain);
