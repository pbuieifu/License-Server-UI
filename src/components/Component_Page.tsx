import { useEffect, useRef, useState } from "react";
import Generic_Component, {
  Data_Component_Generic,
  Props_Component_Generic,
} from "./Component_Generic";
import Handler_Function, {
  Payload_Function,
  Payload_Result,
} from "../handler/Handler_Function";
import { useAppNavigate } from "./Component_App_Router";
import generateUniqueHash from "../helper/generateUniqueHash";
import Handler_Event from "../handler/Handler_Event";

export const Component_Page = ({ data }: Props_Component_Generic) => {
  const key_call = useRef<string>(
    `${data.key_component}${generateUniqueHash()}`
  ).current;
  const handler_event = Handler_Event.getInstance();
  const handler_function = new Handler_Function(handler_event, data);
  const [results, setResults] = useState<Payload_Result[]>([]);
  const [cleanUpFunctions, setCleanUpFunctions] = useState<Payload_Function[]>(
    []
  );
  const [onClick, setOnClick] = useState<Payload_Function[]>([]);

  const handleClick = () => {
    onClick.forEach((func) =>
      func({
        handler_event: handler_event,
        key_call: func({
          handler_event: handler_event,
          key_call: key_call,
        }),
      })
    );
  };

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

    setOnClick(handler_function.generateFunctions("on_click"));
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

  const navigate = useAppNavigate();

  const navigateToPage = () => {
    const result: Payload_Result = handler_function.extractDataFromResult(
      "page_navigation",
      key_call,
      results
    );
    if (result && result.data !== data.content.key_page) {
      navigate(`/${result.data}`);
    }
  };

  useEffect(() => {
    navigateToPage();
  }, [results]);

  return (
    <div data-component="Component_Page" data-css={data.content.css_key}>
      {data.content.children &&
        data.content.children.map(
          (component_data: Data_Component_Generic, index: number) => (
            <Generic_Component data={component_data} key={index} />
          )
        )}
    </div>
  );
};
