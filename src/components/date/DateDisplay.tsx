import React from "react";
import { formatDate, longFormatDate } from "./formatDate";
import { AppTooltip } from "../Tooltip";

const PureDateDisplay = React.memo(({ date }: { date: string | Date }) => {
  return <>{formatDate(date)}</>;
});

export const DateDisplay = React.memo(
  ({ date, simple }: { date: string | Date; simple?: boolean }) => {
    if (simple) return <PureDateDisplay date={date} />;
    return (
      <AppTooltip content={<>{longFormatDate(date)}</>}>
        <span>
          <PureDateDisplay date={date} />
        </span>
      </AppTooltip>
    );
  },
);
