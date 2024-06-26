import { FieldArray, useFormikContext } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons/faTrashCan";
import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { AppTooltip } from "../../../../components/Tooltip";

export function SkippedDates() {
  const form = useFormikContext();

  const exdates = form.getFieldMeta("rrule.exdates").value as string[];
  const hasExdates = exdates.length !== 0;

  const [show, setShow] = useState(false);

  if (!hasExdates) {
    return (
      <AppTooltip
        content={
          <>
            To add skipped dates, skip a transaction in the transactions table.
          </>
        }
      >
        <span>
          <Button
            variant="link"
            className="p-0 m-0"
            style={{
              color: "var(--gray-text)",
              textDecoration: "none",
            }}
            disabled
          >
            No skipped dates
          </Button>
        </span>
      </AppTooltip>
    );
  }

  return (
    <>
      <Button
        variant="link"
        className="p-0 m-0 underline-on-hover"
        style={{
          color: "var(--gray-text)",
          textDecoration: "none",
        }}
        onClick={() => {
          setShow((s) => !s);
        }}
      >
        {show ? <>Hide</> : <>Show</>} skipped dates ({exdates.length})
      </Button>

      {show ? (
        <Container fluid className="mt-1">
          <FieldArray name="rrule.exdates">
            {(exdatesArrayHelpers) => (
              <ul>
                {exdates.sort().map((exdate, index) => (
                  <li key={exdate}>
                    <DateDisplay date={exdate} />{" "}
                    <FontAwesomeIcon
                      style={{
                        marginLeft: 10,
                        color: "var(--red)",
                        cursor: "pointer",
                      }}
                      icon={faTrashCan}
                      title="Delete"
                      onClick={() => {
                        exdatesArrayHelpers.remove(index);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </FieldArray>
        </Container>
      ) : null}
    </>
  );
}
