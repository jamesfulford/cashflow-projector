import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import posthog from "posthog-js";

import "./main.scss";
import { TooltipSingletonProvider } from "./components/Tooltip.tsx";

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

posthog.init("phc_Vgmc1Gq9hqRmpV8GKsjEJXLGvVflRjO4SOBnDUrp8BD", {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  opt_in_site_apps: true,
  session_recording: {
    maskAllInputs: true,
    maskInputFn: (text, element) => {
      if (element?.dataset["mask"] === "true") {
        return "*".repeat(text.length);
      }
      return text;
    },

    maskTextSelector: ".mask", // masks all elements with the class "mask"
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipSingletonProvider>
      <App />
    </TooltipSingletonProvider>
    <SpeedInsights />
    <Analytics />
  </React.StrictMode>,
);
