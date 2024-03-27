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

export type Data_Preferences_Column = {
  key_column: string;
  shown: boolean;
  sorted: boolean;
  direction: Directions;
};

export const Component_Preferences = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [theme, setTheme] = useState<string>();

  const storePreferences = () => {
    const result_api: Payload_Result =
      data.handler_function.extractDataFromResult(
        "api_answer",
        data.key_call,
        results
      );

    if (result_api) {
      data.handleLifecycle({
        input: { key_store: "preferences", data: result_api.data },
      });
      setTheme(result_api.data.theme);
    }
  };

  useEffect(() => {
    storePreferences();
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
