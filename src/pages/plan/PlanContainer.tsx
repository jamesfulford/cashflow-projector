import { rulesState } from "../../store/rules";

import { useSignalValue } from "../../store/useSignalValue";
import { computed } from "@preact/signals-core";
import { PlanLayout } from "./PlanLayout";
import { LandingPage } from "./LandingPage";

const hasRules_ = computed(() => !!rulesState.value.length);

export const PlanContainer = () => {
  const hasRules = useSignalValue(hasRules_);

  return hasRules ? <PlanLayout /> : <LandingPage />;
};
