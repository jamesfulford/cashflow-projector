/* eslint-disable @typescript-eslint/no-explicit-any */

import Tippy from "@tippyjs/react";

export interface InfoProps extends React.PropsWithChildren {
  infobody?: string | React.ReactNode;
}
export const Info = ({ infobody, children }: InfoProps) => (
  <Tippy content={<span>{infobody}</span>} interactive>
    {children as any}
  </Tippy>
);
