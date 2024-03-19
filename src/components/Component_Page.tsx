import { useEffect } from "react";
import Generic_Component, {
  Data_Component_Generic,
  Props_Component_Rendered,
} from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import { useAppNavigate } from "./Component_App_Router";

export const Component_Page = ({ data, results }: Props_Component_Rendered) => {
  const navigate = useAppNavigate();

  const navigateToPage = () => {
    const result: Payload_Result = data.handler_function.extractDataFromResult(
      "page_navigation",
      data.key_call,
      results
    );
    if (result && result.data !== data.json.content.key_page) {
      navigate(`/${result.data}`);
    }
  };

  useEffect(() => {
    navigateToPage();
  }, [results]);

  return (
    <div data-component="Component_Page" data-css={data.json.content.css_key}>
      {data.json.content.children &&
        data.json.content.children.map(
          (component_data: Data_Component_Generic, index: number) => (
            <Generic_Component data={component_data} key={index} />
          )
        )}
    </div>
  );
};
