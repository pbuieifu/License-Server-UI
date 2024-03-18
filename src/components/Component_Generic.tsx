import { FunctionComponent, useEffect, useRef } from "react";
import { Component_Banner } from "./Component_Banner";
import { Component_Button } from "./Component_Button";
import { Component_Container } from "./Component_Container";
import { Component_Page_Title } from "./Component_Page_Title";
import { Component_Text } from "./Component_Text";
import { Component_Page } from "./Component_Page";
import { Component_Header } from "./Component_Header";
import { Component_Footer } from "./Component_Footer";
import Handler_Event from "../handler/Handler_Event";
import Handler_Function from "../handler/Handler_Function";
import { Component_App_Router } from "./Component_App_Router";
import { Component_Dashboard } from "./Component_Dashboard";

export interface Props_Component_Generic {
  data: Data_Component_Generic;
  handler_event: Handler_Event;
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
      on_click?: string[];
    };
    children?: Data_Component_Generic[];
  };
}

const Component_Map: Record<
  string,
  FunctionComponent<Props_Component_Generic>
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
  text: Component_Text,
};

const Component_Generic = ({
  data,
  handler_event,
}: Props_Component_Generic) => {
  const Component_Rendered = Component_Map[data.key_component];
  const handler_event_ref = useRef<Handler_Event>(new Handler_Event()).current;

  const initializeComponent = async () =>
    handler_event.adoptChild(handler_event_ref);

  useEffect(() => {
    initializeComponent();
  }, []);

  if (data.enabled && Component_Rendered) {
    return <Component_Rendered data={data} handler_event={handler_event_ref} />;
  }

  return <></>;
};

export default Component_Generic;
