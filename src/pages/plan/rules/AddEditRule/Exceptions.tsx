import BSForm from "react-bootstrap/esm/Form";
import { FieldArray, useFormikContext } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Accordion from "react-bootstrap/esm/Accordion";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";
import InputGroup from "react-bootstrap/esm/InputGroup";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { startDateState } from "../../../../store/parameters";
import Button from "react-bootstrap/esm/Button";
import { useSignalValue } from "../../../../store/useSignalValue";

function DateAdder({
  onAdd,
  min,
}: {
  onAdd: (date: string) => void;
  min: string;
}) {
  const [value, setValue] = useState("");
  return (
    <InputGroup>
      <BSForm.Control
        type="date"
        min={min}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />{" "}
      <InputGroup.Text>
        <FontAwesomeIcon
          title="Add"
          icon={faPlus}
          style={{
            color: "var(--primary)",
          }}
          onClick={() => {
            onAdd(value);
          }}
        />
      </InputGroup.Text>
    </InputGroup>
  );
}

export function Exceptions() {
  const startDate = useSignalValue(startDateState);

  const form = useFormikContext();

  const exdates = form.getFieldMeta("rrule.exdates").value as string[];
  const rdates = form.getFieldMeta("rrule.rdates").value as string[];

  const [showExceptions, setShowExceptions] = useState(false);

  return (
    <>
      <Button
        variant="link"
        className="p-0 m-0 underline-on-hover"
        style={{
          color: "var(--tertiary)",
          textDecoration: "none",
        }}
        onClick={() => {
          setShowExceptions((s) => !s);
        }}
      >
        <>
          Exceptions: {exdates.length + rdates.length} (
          {showExceptions ? <>hide</> : <>show</>})
        </>
      </Button>

      {showExceptions ? (
        <Accordion flush>
          <FieldArray name="rrule.exdates">
            {(exdatesArrayHelpers) => (
              <Accordion.Item eventKey="1">
                <Accordion.Button className="p-1">
                  Exclusions ({exdates.length})
                </Accordion.Button>
                <Accordion.Body>
                  <ul>
                    {exdates.sort().map((exdate, index) => (
                      <li key={exdate}>
                        {exdate}{" "}
                        <FontAwesomeIcon
                          style={{
                            marginLeft: 10,
                            color: "var(--red)",
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
                  <DateAdder
                    min={startDate}
                    onAdd={(d) => exdatesArrayHelpers.push(d)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            )}
          </FieldArray>
          <FieldArray name="rrule.rdates">
            {(rdatesArrayHelpers) => (
              <Accordion.Item eventKey="2">
                <Accordion.Button className="p-1">
                  Inclusions ({rdates.length})
                </Accordion.Button>
                <Accordion.Body>
                  <ul>
                    {rdates.sort().map((rdate, index) => (
                      <li>
                        {rdate}{" "}
                        <FontAwesomeIcon
                          style={{
                            marginLeft: 10,
                            color: "var(--red)",
                          }}
                          icon={faTrashCan}
                          title="Delete"
                          onClick={() => {
                            rdatesArrayHelpers.remove(index);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                  <DateAdder
                    min={startDate}
                    onAdd={(d) => rdatesArrayHelpers.push(d)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            )}
          </FieldArray>
        </Accordion>
      ) : null}
    </>
  );
}
