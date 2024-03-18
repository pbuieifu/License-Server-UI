import React, { useEffect, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Function, Payload_Result } from "../handler/Handler_Function";
import generateUniqueHash from "../helper/generateUniqueHash";

const user_preferences = {
  columns: [
    { column_key: "client", enabled: true },
    { column_key: "product", enabled: true },
    { column_key: "product_version", enabled: true },
    { column_key: "module", enabled: true },
    { column_key: "component", enabled: true },
    { column_key: "status", enabled: true },
    { column_key: "time_left", enabled: true },
    { column_key: "action_required", enabled: true },
  ],
};
const api_data = {};

const Component_Header_Button = ({}) => {};
const Component_Header = ({}) => {};

const Component_Row_Button = ({}) => {};
const Component_Row = ({}) => {};

//on load get data from api
//generate column buttons based on preference data
//generate rows based on preference + api data

export const Component_Dashboard = ({
  data,
  handler_event,
  handler_function,
}: Props_Component_Rendered) => {
  const key_call = `${data.component_key}${generateUniqueHash()}`;
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
    <div
      data-component="Component_Template"
      data-css={data.content.css_key}
      onClick={handleClick}
    >
      Component_Template
    </div>
  );
};
