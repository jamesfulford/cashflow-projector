import { fileOpen, fileSave } from "browser-fs-access";
import { useCallback, useRef, useState } from "react";
import { ParameterService } from "../../services/ParameterService";
import { RulesService } from "../../services/RulesService";

export const SelectPlanFile = ({ children }: React.PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const handleRef = useRef<FileSystemFileHandle | undefined>();
  const pickPlanFile = useCallback(async () => {
    const blob = await fileOpen({
      mimeTypes: ["application/json"],
      extensions: [".json"],
    });

    const { parameters, rules } = JSON.parse(await blob.text());
    await Promise.all([
      ParameterService.setParameters(parameters),
      RulesService.overwriteRules(rules),
    ]);
    handleRef.current = blob.handle;
    setIsReady(true);
  }, []);

  const savePlanFile = useCallback(async () => {
    const [rules, parameters] = await Promise.all([
      RulesService.fetchRules(),
      ParameterService.fetchParameters(),
    ]);
    const blob = new Blob([JSON.stringify({ rules, parameters }, null, 4)], {
      type: "application/json",
    });

    await fileSave(
      blob,
      {
        fileName: "Plan.json",
        extensions: [".json"],
        id: "financial-plans",
      },
      handleRef.current,
    );
  }, []);

  if (!isReady) {
    return <h1 onClick={pickPlanFile}>Pick plan file...</h1>;
  }

  return (
    <>
      <h1 onClick={pickPlanFile}>Pick plan file...</h1>
      <h2 onClick={savePlanFile}>Save</h2>
      {children}
    </>
  );
};
