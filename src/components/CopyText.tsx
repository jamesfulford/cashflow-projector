import { useCallback, useRef, useState } from "react";
import { OverlayTrigger, Popover, PopoverBody } from "react-bootstrap";
import Button from "react-bootstrap/Button";

export function CopyTextButton(
  props: Parameters<typeof Button>[0] & { text: string },
) {
  const [showCopied, setShowCopied] = useState(false);

  const textRef = useRef<HTMLInputElement>(null);
  const copyToClipboard = useCallback(() => {
    if (textRef.current) {
      textRef.current.select();
      document.execCommand("copy");
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    }
  }, []);

  return (
    <>
      <input
        ref={textRef}
        type="text"
        value={props.text}
        readOnly
        style={{ position: "absolute", left: "-9999px" }}
      />
      <OverlayTrigger
        show={showCopied}
        overlay={
          <Popover>
            <PopoverBody className="p-2">Copied to clipboard!</PopoverBody>
          </Popover>
        }
      >
        <Button {...props} onClick={copyToClipboard}>
          {props.children}
        </Button>
      </OverlayTrigger>
    </>
  );
}
