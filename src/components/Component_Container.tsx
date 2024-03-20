import { useEffect } from "react";
import Component_Generic, {
  Data_Component_Generic,
  Props_Component_Rendered,
} from "./Component_Generic";

export const Component_Container = ({
  data,
  results,
}: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <div
      data-component="Component_Container"
      data-css={data.json.content.css_key}
    >
      {data.json.content.children &&
        data.json.content.children.map(
          (component_data: Data_Component_Generic, index: number) => (
            <Component_Generic data={component_data} key={index} />
          )
        )}
    </div>
  );
};
