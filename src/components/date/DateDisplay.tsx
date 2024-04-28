import React from "react";
import { formatDate, longFormatDate } from "./formatDate";
import Tippy, { useSingleton } from "@tippyjs/react";

const PureDateDisplay = React.memo(({ date }: { date: string | Date }) => {
  return <>{formatDate(date)}</>;
});

export const DateDisplay = React.memo(
  ({
    date,
    simple,
    tippyTarget,
  }: {
    date: string | Date;
    simple?: boolean;
    tippyTarget?: ReturnType<typeof useSingleton>[1];
  }) => {
    if (simple) return <PureDateDisplay date={date} />;
    return (
      <Tippy singleton={tippyTarget} content={<>{longFormatDate(date)}</>}>
        <span>
          <PureDateDisplay date={date} />
        </span>
      </Tippy>
    );
  },
);
