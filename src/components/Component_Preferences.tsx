import React, { useEffect, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import { Directions } from "./Component_Dashboard";

export type Data_Preferences = {
  theme: string;
  dashboard: {
    columns: Data_Preferences_Column[];
  };
};

export interface Data_Preferences_Column  {
  key_column: string;
  shown: boolean;
  sorted: boolean;
  direction: Directions;
  row_order: number;
};

export const Component_Preferences = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [theme, setTheme] = useState<string>();

  const storePreferences = (result_api: Payload_Result) => {
    data.handleLifecycle({
      input: { key_store: "preferences", data: result_api.data },
    });
    setTheme(result_api.data.theme);
  };

  const parseResults = () => {
    const result_api: Payload_Result =
      data.handler_function.extractDataFromResult(
        "api_answer",
        data.key_call,
        results
      );

    if (result_api) storePreferences(result_api);

    const result_preferences: Payload_Result =
      data.handler_function.extractDataFromResult(
        "preferences_update",
        data.key_call,
        results
      );

    if (result_preferences) storePreferences(result_preferences);
  };

  useEffect(() => {
    parseResults();
  }, [results]);

  return (
    theme && (
      <link
        rel="stylesheet"
        type="text/css"
        href={`assets/themes/${theme}.css`}
      />
    )
  );
};
