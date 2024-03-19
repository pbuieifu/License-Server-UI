import React, { useEffect, useRef, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Template = ({ data }: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <div
      data-component="Component_Template"
      data-css={data.json.content.css_key}
      onClick={data.handleClick}
    >
      Component_Template
    </div>
  );
};
