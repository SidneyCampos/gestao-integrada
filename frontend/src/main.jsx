/**
 * @file main.jsx
 * @description Ponto de entrada (Entrypoint) principal do Frontend React.
 * Anexa a aplicação React à div com id 'root' no index.html e renderiza o componente App.
 * @module Frontend/Main
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
