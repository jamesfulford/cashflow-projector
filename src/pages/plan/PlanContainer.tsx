import { useEffect, useRef, useState } from "react";

import { Loading } from "./Loading";
import { initializeEngine } from "../../services/pyodide";
import { PlanLayout } from "./PlanLayout";

export const PlanContainer = () => {
  // this layer should just initialize the pyodide engine
  const [isReady, setIsReady] = useState(false);
  const isLoadingRef = useRef<boolean>(false);
  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    initializeEngine().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <Loading />;
  }
  return <PlanLayout />;
};
