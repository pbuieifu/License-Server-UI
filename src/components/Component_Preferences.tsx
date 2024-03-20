import React, { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";

export const Component_Preferences = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const setPreferences = () => {
    const result_api: Payload_Result =
      data.handler_function.extractDataFromResult(
        "api_answer",
        data.key_call,
        results
      );

    if (result_api)
      data.handleLifecycle({ key_store: "preferences", data: result_api.data });
  };

  useEffect(() => {
    setPreferences();
  }, [results]);

  return null;
};
