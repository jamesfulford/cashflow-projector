import React from "react";
import { formatDate, longFormatDate } from "./formatDate";
import { AppTooltip } from "../Tooltip";
import { formatDistance } from "date-fns/formatDistance";
import { startDateState } from "../../store/parameters";
import { useSignalValue } from "../../store/useSignalValue";

const PureDateDisplay = React.memo(({ date }: { date: string | Date }) => {
  return <>{formatDate(date)}</>;
});

export const DateDisplay = ({
  date,
  simple,
}: {
  date: string | Date;
  simple?: boolean;
}) => {
  const startDate = useSignalValue(startDateState);

  if (simple) return <PureDateDisplay date={date} />;

  return (
    <AppTooltip
      content={
        <>
          {longFormatDate(date)}
          <br />
          (in {formatDistance(date, startDate)})
        </>
      }
    >
      <span>
        <PureDateDisplay date={date} />
      </span>
    </AppTooltip>
  );
};
