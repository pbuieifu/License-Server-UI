// main.tsx is the entry point for the React application.
// It is responsible for rendering the top-level App component into the DOM.

// Importing ReactDOM from 'react-dom/client'.
// This package provides DOM-specific methods that can be used at the top level of a web app
// to enable an efficient way of managing DOM elements of the web app.
import ReactDOM from "react-dom/client";

// Importing the App component from App.tsx.
// App is the root component that acts as the starting point of the application UI.
import App from "./App.tsx";

// Creating a root DOM node with ReactDOM.createRoot.
// This is where our React app starts its rendering.
// 'document.getElementById("root")' finds the div with id 'root' in our index.html file,
// and '!' asserts that the element exists (non-null assertion in TypeScript).
// The .render method then mounts the App component onto this root DOM node.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
