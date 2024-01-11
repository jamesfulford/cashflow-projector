import {
  OverlayTrigger,
  OverlayTriggerProps,
  Popover,
  PopoverBody,
  PopoverHeader,
} from "react-bootstrap";

export type InfoProps = {
  infotitle?: string | React.ReactNode;
  infobody?: string | React.ReactNode;
  children: React.PropsWithChildren["children"];
  placement?: OverlayTriggerProps["placement"];
};
export const Info = ({
  infotitle,
  infobody,
  children,
  placement,
}: InfoProps) => (
  <OverlayTrigger
    trigger="click"
    placement={placement || "auto"}
    overlay={
      <Popover>
        {infotitle && <PopoverHeader>{infotitle}</PopoverHeader>}
        {infobody && <PopoverBody>{infobody}</PopoverBody>}
      </Popover>
    }
  >
    <span className="d-inline-block">{children}</span>
  </OverlayTrigger>
);
