/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppTooltip } from "./Tooltip";

export interface InfoProps extends React.PropsWithChildren {
  infobody?: string | React.ReactNode;
}
export const Info = ({ infobody, children }: InfoProps) => (
  <AppTooltip content={<span>{infobody}</span>} interactive>
    {children as any}
  </AppTooltip>
);
