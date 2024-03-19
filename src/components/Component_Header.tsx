import { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Header = ({ data }: Props_Component_Rendered) => {
  return (
    <div data-component="Component_Header" data-css={data.json.content.css_key}>
      Component_Header
    </div>
  );
};
