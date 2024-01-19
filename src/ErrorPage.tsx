import Container from "react-bootstrap/esm/Container";
import Button from "react-bootstrap/esm/Button";
import { ClearLocalStorageModal } from "./components/ClearLocalStorageModal";
import { useState } from "react";
import { feedbackHref } from "./components/Feedback";
import { CopyTextButton } from "./components/CopyText";

export function ErrorPage() {
  const [showEraseDataModal, setShowEraseDataModal] = useState(false);
  return (
    <Container>
      <Container fluid>
        <h3>Something went wrong.</h3>
        We're not sure what, but something definitely did.
      </Container>
      <br />
      <Container>Try one of these tricks:</Container>
      <Container fluid>
        <ul>
          <li className="mt-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline-primary"
            >
              Refresh the page
            </Button>
          </li>
          <li className="mt-2">
            <Button
              as="a"
              href={feedbackHref}
              target="_blank"
              variant="outline-secondary"
            >
              Report a bug
            </Button>
          </li>
          <li className="mt-2">
            Contact{" "}
            <CopyTextButton variant="outline-secondary">
              @semimajor42
            </CopyTextButton>{" "}
            on Discord
          </li>
          <li className="mt-2">
            In case of corrupted data:{" "}
            <Button
              variant="outline-danger"
              onClick={() => {
                setShowEraseDataModal(true);
              }}
            >
              Erase data
            </Button>
          </li>
        </ul>

        <ClearLocalStorageModal
          show={showEraseDataModal}
          setShow={setShowEraseDataModal}
        />
      </Container>
    </Container>
  );
}

export function Bomb() {
  const params = new URLSearchParams(
    window.location.href.split("?").slice(1).join("?"),
  );
  if (params.has("bomb")) throw new Error("nah, I dont feel like rendering");
  return null;
}
