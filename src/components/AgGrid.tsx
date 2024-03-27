import React from "react";

export const AgGrid = React.lazy(async () => {
  const module = await import("ag-grid-react");

  return { default: module.AgGridReact };
});
