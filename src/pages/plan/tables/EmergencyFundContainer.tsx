import { EmergencyFundCoverageSection } from "./EmergencyFundCoverageSection";
import { EmergencyScenarioSection } from "./EmergencyScenarioSection";

// function formatEmergencyFundDurationMonths(
//   startDate: string,
//   endDate: string,
// ): string {
//   const days = daysBetween(
//     fromStringToDate(endDate),
//     fromStringToDate(startDate),
//   );
//   const halfMonths = Math.floor(days / 15);
//   const months = halfMonths / 2;
//   if (Number.isInteger(months)) return `${months}`; // 1
//   return months.toFixed(1); // 1.5
// }

export function EmergencyFundContainer() {
  return (
    <>
      <EmergencyFundCoverageSection />
      <hr />
      <EmergencyScenarioSection />
    </>
  );
}
