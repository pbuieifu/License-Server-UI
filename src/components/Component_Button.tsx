import { useEffect } from "react";
import { Props_Component_Rendered } from "./Component_Generic";

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const Component_Button = ({ data }: Props_Component_Rendered) => {
  /*   useEffect(() => {
    console.log(results);
  }, [results]); */

  return (
    <button
      data-component="Component_Button"
      data-css={data.json.content.css_key}
      onClick={data.handleClick}
    >
      {JSON.stringify(data)}
    </button>
  );
};
