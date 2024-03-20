import { FunctionComponent, useEffect, useRef, useState } from "react";
import { Component_Banner } from "./Component_Banner";
import { Component_Button } from "./Component_Button";
import { Component_Container } from "./Component_Container";
import { Component_Page_Title } from "./Component_Page_Title";
import { Component_Text } from "./Component_Text";
import { Component_Page } from "./Component_Page";
import { Component_Header } from "./Component_Header";
import { Component_Footer } from "./Component_Footer";
import { Component_App_Router } from "./Component_App_Router";
import { Component_Dashboard } from "./Component_Dashboard";
import Handler_Event from "../handler/Handler_Event";
import Handler_Function, {
  Payload_Function,
  Payload_Result,
} from "../handler/Handler_Function";
import generateUniqueHash from "../helper/generateUniqueHash";
import { Component_Preferences } from "./Component_Preferences";

export interface Props_Component_Generic {
  data: Data_Component_Generic;
}

interface Data_Component_Rendered {
  key_call: string;
  json: Data_Component_Generic;
  handler_event: Handler_Event;
  handler_function: Handler_Function;
  handleLifecycle: (input: any) => void;
}

export interface Props_Component_Rendered {
  data: Data_Component_Rendered;
  results: Payload_Result[];
}

export interface Data_Component_Generic {
  key_component: string;
  enabled: boolean;
  content: {
    css_key?: string;
    key_page?: string;
    functions?: {
      mount?: string[];
      unmount?: string[];
      lifecycle?: string[];
    };
    children?: Data_Component_Generic[];
    text?: string;
  };
}

const Component_Map: Record<
  string,
  FunctionComponent<Props_Component_Rendered>
> = {
  app_router: Component_App_Router,
  banner: Component_Banner,
  button: Component_Button,
  container: Component_Container,
  dashboard: Component_Dashboard,
  footer: Component_Footer,
  header: Component_Header,
  page: Component_Page,
  page_title: Component_Page_Title,
  preferences: Component_Preferences,
  text: Component_Text,
};

const Component_Generic = ({ data }: Props_Component_Generic) => {
  const Component_Rendered = Component_Map[data.key_component];
  const key_call = useRef<string>(
    `${data.key_component}${generateUniqueHash()}`
  ).current;
  const handler_event = Handler_Event.getInstance();
  const handler_function = new Handler_Function(handler_event, data);
  const [results, setResults] = useState<Payload_Result[]>([]);
  const [cleanUpFunctions, setCleanUpFunctions] = useState<Payload_Function[]>(
    []
  );
  const [componentData, setComponentData] = useState<Data_Component_Rendered>();

  const initializeComponent = async () => {
    handler_function.generateFunctions("mount", {
      handler_event: handler_event,
      key_call: key_call,
      setResults: setResults,
    });

    setCleanUpFunctions(
      handler_function.generateFunctions("unmount", {
        handler_event: handler_event,
        key_call: key_call,
        setResults: setResults,
      })
    );

    setComponentData({
      key_call: key_call,
      json: data,
      handler_event: handler_event,
      handler_function: handler_function,
      handleLifecycle: (input: any) => {
        handler_function.generateFunctions("lifecycle").forEach((func) =>
          func({
            handler_event: handler_event,
            key_call: func({
              handler_event: handler_event,
              key_call: key_call,
              data: input,
            }),
          })
        );
      },
    });
  };

  const cleanUp = () => {
    cleanUpFunctions.forEach((func: Payload_Function) => func());
  };

  useEffect(() => {
    initializeComponent();

    return () => {
      cleanUp();
    };
  }, []);

  useEffect(() => {
    if (results.length > 0) console.log(results);
  }, [results]);

  if (data.enabled && Component_Rendered && componentData) {
    return <Component_Rendered data={componentData} results={results} />;
  }

  return null;
};

export default Component_Generic;
