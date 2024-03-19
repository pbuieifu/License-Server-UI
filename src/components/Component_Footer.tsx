import { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Footer = ({ data }: Props_Component_Rendered) => {
  return (
    <div data-component="Component_Footer" data-css={data.json.content.css_key}>
      Component_Footer
    </div>
  );
};
