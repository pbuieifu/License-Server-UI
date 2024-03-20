import { FunctionComponent, Suspense, useEffect, useState } from "react";
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

export const Component_App_Router = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [pages, setPages] = useState<Data_Component_Generic[]>();
  const [structuralComponents, setStructuralComponents] =
    useState<Data_Component_Generic[]>();

  const initializeInfrastructure = () => {
    let children_pages: Data_Component_Generic[] = [];
    let children_structural_components: Data_Component_Generic[] = [];

    data.json.content.children?.map((child: Data_Component_Generic) => {
      if (child && child.enabled) {
        if (child.key_component === "page") children_pages.push(child);
        else children_structural_components.push(child);
      }
    });

    setPages(children_pages);
    setStructuralComponents(children_structural_components);
  };

  useEffect(() => {
    initializeInfrastructure();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {pages?.map((page: Data_Component_Generic, index: number) => {
              const path = `/${page.content.key_page}`;
              return (
                <Route
                  key={path + index}
                  path={path}
                  element={<Generic_Component key={path} data={page} />}
                />
              );
            })}

            <Route path="*" element={<Redirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      {structuralComponents?.map(
        (component: Data_Component_Generic, index: number) => {
          return <Generic_Component key={index} data={component} />;
        }
      )}
    </>
  );
};
