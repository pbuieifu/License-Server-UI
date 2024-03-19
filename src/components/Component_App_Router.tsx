import { FunctionComponent, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Generic_Component, {
  Data_Component_Generic,
  Props_Component_Rendered,
} from "./Component_Generic";

export function useAppNavigate() {
  let navigate = useNavigate();

  return (path: string, newTab = false) => {
    // Changed default to false for internal navigation
    if (path.startsWith("http") || path.startsWith("https")) {
      // External URL logic remains the same
    } else {
      // Internal URL
      if (newTab) {
        window.open(window.location.origin + path, "_blank");
      } else {
        navigate(path);
      }
    }
  };
}

const Redirect: FunctionComponent = () => {
  const navigate = useAppNavigate();
  useEffect(() => {
    navigate("/Home");
  }, []);

  return null;
};

export const Component_App_Router = ({ data }: Props_Component_Rendered) => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {data.json.content.children?.map(
            (page: Data_Component_Generic, index: number) => {
              if (page && page.enabled) {
                const path = `/${page.content.key_page}`;
                return (
                  <Route
                    key={path + index}
                    path={path}
                    element={<Generic_Component key={path} data={page} />}
                  />
                );
              }
              return null;
            }
          )}
          <Route path="*" element={<Redirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
