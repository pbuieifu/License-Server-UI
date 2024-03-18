import { FunctionComponent, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Generic_Component, {
  Data_Component_Generic,
  Props_Component_Rendered,
} from "./Component_Generic";
import generateUniqueHash from "../helper/generateUniqueHash";
import { Payload_Function, Payload_Result } from "../handler/Handler_Function";

export function useAppNavigate() {
  let navigate = useNavigate();

  return (path: string, newTab = true) => {
    if (path.startsWith("http") || path.startsWith("https")) {
      // External URL
      if (newTab) {
        window.open(path, "_blank");
      } else {
        window.location.href = path;
      }
    } else {
      // Internal URL
      navigate(path);
    }
  };
}

const Redirect: FunctionComponent = () => {
  const navigate = useAppNavigate();
  useEffect(() => {
    navigate("/Home");
  }, []);

  return <></>;
};

export const Component_App_Router = ({
  data,
  handler_event,
  handler_function,
}: Props_Component_Rendered) => {
  const key_call = `${data.component_key}${generateUniqueHash()}`;
  const [results, setResults] = useState<Payload_Result[]>([]);
  const [cleanUpFunctions, setCleanUpFunctions] = useState<Payload_Function[]>(
    []
  );
  const [onClick, setOnClick] = useState<Payload_Function[]>([]);

  const handleClick = () => {
    onClick.forEach((func) =>
      func({
        handler_event: handler_event,
        key_call: func({
          handler_event: handler_event,
          key_call: key_call,
        }),
      })
    );
  };

  const initializeComponent = async () => {
    handler_function.generateFunctions("mount", {
      handler_event: handler_event,
      key_call: key_call,
      setResults: setResults,
    });

    setCleanUpFunctions(
      handler_function.generateFunctions("unmount", {
        handler_event: handler_event,
        key_call: key_call,
        setResults: setResults,
      })
    );

    setOnClick(handler_function.generateFunctions("on_click"));
  };

  const cleanUp = () => {
    cleanUpFunctions.forEach((func: Payload_Function) => func());
  };

  useEffect(() => {
    initializeComponent();

    return () => {
      cleanUp();
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback>
        <Routes>
          {data.content.children?.map(
            (page: Data_Component_Generic, index: number) => {
              if (page && page.enabled)
                return (
                  <Route
                    key={page.content.page_key && page.content.page_key + index}
                    path={`/${page.content.page_key}`}
                    element={
                      <Generic_Component
                        data={page}
                        handler_event={handler_event}
                      />
                    }
                  />
                );
            }
          )}
          {<Route path="*" element={<Redirect />} />}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
