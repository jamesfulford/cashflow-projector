import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import posthog from "posthog-js";

import "bootstrap/dist/css/bootstrap.min.css";

import "./main.css";

posthog.init("phc_Vgmc1Gq9hqRmpV8GKsjEJXLGvVflRjO4SOBnDUrp8BD", {
  api_host: "https://app.posthog.com",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
