import { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Component_Display_HTML } from "./Component_Display_HTML";

export const Component_Button = ({
  data,
  results,
}: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <button
      data-component="Component_Button"
      data-css={data.json.content.css_key}
      onClick={() => data.handleLifecycle({ input: "" })}
    >
      <Component_Display_HTML html={data.json.content.text} />
    </button>
  );
};
