import "./Parameters.css";

import { CheckingCard } from "./checking/CheckingCard";
import { EmergencyFundCard } from "./emergency-fund/EmergencyFundCard";
import { SavingsCard } from "./savings/SavingsCard";

export const ParametersContainer = () => {
  return (
    <div>
      <CheckingCard />
      <SavingsCard />
      <EmergencyFundCard />
    </div>
  );
};
