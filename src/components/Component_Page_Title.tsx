import { useEffect } from "react";

import { Component_Display_HTML } from "./Component_Display_HTML";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Page_Title = ({
  data,
  results,
}: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <h1
      data-component="Component_Page_Title"
      data-css={data.json.content.css_key}
    >
      <Component_Display_HTML html={data.json.content.text} />
    </h1>
  );
};
