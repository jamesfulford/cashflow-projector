import { useEffect, useState } from "react";

import { Loading } from "./Loading";
import { initializeEngine } from "../../services/pyodide";
import { PlanLayout } from "./PlanLayout";

export const PlanContainer = () => {
  // this layer should just initialize the pyodide engine
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    initializeEngine().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <Loading />;
  }
  return <PlanLayout />;
};
