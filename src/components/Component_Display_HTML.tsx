interface Props_Component_Display_HTML {
  html?: string; // Optional markdown string to be rendered.
}

export const Component_Display_HTML = ({
  html,
}: Props_Component_Display_HTML) => {
  // Function to decode HTML entities.
  const decodeHtmlEntities = (input?: string): string => {
    if (input) {
      var txt = document.createElement("textarea");
      txt.innerHTML = input;
      return decodeURIComponent(txt.value);
    } else return "";
  };

  // Function to find URLs and wrap them in <a> tags.
  const hyperlinkUrls = (text: string): string => {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  };

  const processedHtml = hyperlinkUrls(decodeHtmlEntities(html));

  const returnHTML = {
    __html: processedHtml,
  };

  // Note: dangerouslySetInnerHTML is used here to insert raw HTML,
  // but one must ensure the markdown content is sanitized to prevent XSS attacks.
  return (
    <div
      data-component="Component_Display_HTML"
      dangerouslySetInnerHTML={returnHTML}
    />
  );
};
