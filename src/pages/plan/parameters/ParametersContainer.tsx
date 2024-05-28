import "./Parameters.css";

import { CheckingCard } from "./checking/CheckingCard";
import { SavingsCard } from "./savings/SavingsCard";

export const ParametersContainer = () => {
  return (
    <div>
      <CheckingCard />
      <SavingsCard />
    </div>
  );
};
