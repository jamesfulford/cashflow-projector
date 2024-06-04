import { computed } from "@preact/signals-core";
import "./Parameters.css";

import { CheckingCard } from "./checking/CheckingCard";
import { SavingsCard } from "./savings/SavingsCard";
import { hasEmergencyFundState } from "../../../store/rules";
import { useSignalValue } from "../../../store/useSignalValue";
import { EmergencyFundCard } from "./emergency-fund/EmergencyFundCard";

const showInsightsState = computed(() => {
  return hasEmergencyFundState.value;
});
export const ParametersContainer = () => {
  const showInsights = useSignalValue(showInsightsState);
  return (
    <div>
      {/* accounts */}
      <CheckingCard />
      <SavingsCard />
      {showInsights ? <hr /> : null}
      {/* insights */}
      <EmergencyFundCard />
    </div>
  );
};
