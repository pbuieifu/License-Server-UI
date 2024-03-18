import { useEffect, useState } from "react";
import Component_Generic, {
  Data_Component_Generic,
  Props_Component_Generic,
} from "./Component_Generic";
import Handler_Function, {
  Payload_Function,
  Payload_Result,
} from "../handler/Handler_Function";
import generateUniqueHash from "../helper/generateUniqueHash";

export const Component_Container = ({
  data,
  handler_event,
}: Props_Component_Generic) => {
  const key_call = `${data.key_component}${generateUniqueHash()}`;
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

  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <div data-component="Component_Container" data-css={data.content.css_key}>
      {data.content.children &&
        data.content.children.map(
          (component_data: Data_Component_Generic, index: number) => (
            <Component_Generic
              data={component_data}
              handler_event={handler_event}
              key={index}
            />
          )
        )}
    </div>
  );
};
