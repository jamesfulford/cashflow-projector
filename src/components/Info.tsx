import type { OverlayTriggerProps } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import PopoverBody from "react-bootstrap/PopoverBody";
import PopoverHeader from "react-bootstrap/PopoverHeader";

export interface InfoProps extends React.PropsWithChildren {
  infotitle?: string | React.ReactNode;
  infobody?: string | React.ReactNode;
  placement?: OverlayTriggerProps["placement"];
  trigger?: OverlayTriggerProps["trigger"];
}
export const Info = ({
  infotitle,
  infobody,
  children,
  placement,
  trigger,
}: InfoProps) => (
  <OverlayTrigger
    trigger={trigger || "click"}
    placement={placement || "auto"}
    overlay={
      <Popover>
        {infotitle && <PopoverHeader>{infotitle}</PopoverHeader>}
        {infobody && <PopoverBody>{infobody}</PopoverBody>}
      </Popover>
    }
  >
    {children as any}
  </OverlayTrigger>
);
