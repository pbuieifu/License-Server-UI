import React, { useEffect, useRef, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";

export const Component_Template = ({
  data,
  results,
}: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <div
      data-component="Component_Template"
      data-css={data.json.content.css_key}
      onClick={data.handleLifecycle}
    >
      Component_Template
    </div>
  );
};
