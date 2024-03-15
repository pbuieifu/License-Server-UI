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
} from "../component/Component_Generic";

interface Context_Brain_Value {
  handler_event_global: Handler_Event;
  handler_error: Handler_Error;
  handler_environment?: Handler_Environment;
  handler_api: Handler_API;
}

interface Payload_Store {
  key: string;
  data: any;
}

interface State {
  [key: string]: any;
}

const Brain = createContext<Context_Brain_Value>({} as Context_Brain_Value);

export const Context_Brain = () => {
  const handler_event_global = useRef(new Handler_Event()).current;
  const handler_error = useRef(
    Handler_Error.getInstance(handler_event_global)
  ).current;
  const handler_environment_instance = useRef(
    Handler_Environment.getInstance(handler_event_global)
  ).current;
  const handler_api = useRef(
    Handler_API.getInstance(handler_event_global)
  ).current;

  const [handler_environment, set_handler_Environment] =
    useState<Handler_Environment>();
  const [ready, setReady] = useState<boolean>(false);
  const [states, setStates] = useState<State>({});
  const [appData, setAppData] = useState<Data_Component_Generic>(
    {} as Data_Component_Generic
  );

  const storeShortTerm = (payload: Payload_Store) => {
    setStates((prevState) => ({ ...prevState, [payload.key]: payload.data }));
  };

  const storeLongTerm = (payload: Payload_Store) => {
    localStorage.setItem(payload.key, JSON.stringify(payload.data));
  };

  const retrieveData = (key: string) => {
    const stateData = states[key];
    if (stateData !== undefined) {
      return stateData;
    }

    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : undefined;
  };

  const initializeApp = (handler: Handler_Environment) => {
    const data_app = handler.sanitizedObjectLookUp({
      fallback: [],
      path: ["subscriber_content", "app"],
    });

    setAppData(data_app);
  };

  const initializeEnvironment = async () => {
    await Handler_Environment.initialize("environment/Environment.json");
    initializeApp(handler_environment_instance);
    set_handler_Environment(handler_environment_instance);
  };

  const initializeStorage = () => {
    handler_event_global.subscribe(
      "store_short_term",
      (payload: Payload_Store) => {
        storeShortTerm(payload);
      }
    );
    handler_event_global.subscribe(
      "store_long_term",
      (payload: Payload_Store) => {
        storeLongTerm(payload);
      }
    );
  };

  const initializeRetrieve = () => {
    handler_event_global.subscribe("retrieve", (key: string) => {
      retrieveData(key);
    });
  };

  const cleanUp = () => {
    handler_event_global.unsubscribe(
      "store_short_term",
      (payload: Payload_Store) => {
        storeShortTerm(payload);
      }
    );
    handler_event_global.unsubscribe(
      "store_long_term",
      (payload: Payload_Store) => {
        storeLongTerm(payload);
      }
    );
    handler_event_global.unsubscribe("retrieve", (key: string) => {
      retrieveData(key);
    });
  };

  const initializeContext = async () => {
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
    handler_event_global,
    handler_error,
    handler_environment,
    handler_api,
  };

  return ready ? (
    <Brain.Provider value={contextValue}>
      <Component_Generic data={appData} handler_event={handler_event_global} />
    </Brain.Provider>
  ) : (
    <></>
  );
};

export const useBrain = () => useContext(Brain);
