import { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Component_Display_HTML } from "./Component_Display_HTML";

export const Component_Footer = ({
  data,
  results,
}: Props_Component_Rendered) => {
  return (
    <div data-component="Component_Footer" data-css={data.json.content.css_key}>
      <Component_Display_HTML html={data.json.content.text} />
    </div>
  );
};
