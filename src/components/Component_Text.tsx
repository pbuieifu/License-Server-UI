import { useEffect } from "react";
import { Component_Display_HTML } from "./Component_Display_HTML";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Text = ({ data }: Props_Component_Rendered) => {
  /*    useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <p data-component="Component_Text" data-css={data.json.content.css_key}>
      <Component_Display_HTML html={JSON.stringify(data)} />
    </p>
  );
};
