import React, { useEffect, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Function, Payload_Result } from "../handler/Handler_Function";
import generateUniqueHash from "../helper/generateUniqueHash";

export const Component_Footer = ({
  data,
  handler_event,
  handler_function,
}: Props_Component_Rendered) => {
  const key_call = `${data.key_component}${generateUniqueHash()}`;
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

  return (
    <div data-component="Component_Footer" data-css={data.content.css_key}>
      Component_Footer
    </div>
  );
};
