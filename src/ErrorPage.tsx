import Container from "react-bootstrap/esm/Container";
import Button from "react-bootstrap/esm/Button";
import { feedbackHref } from "./components/Feedback";
import { CopyTextButton } from "./components/CopyText";
import { urlParams } from "./services/url-params";

export function ErrorPage() {
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
            <CopyTextButton variant="outline-secondary" text={"@semimajor42"}>
              @semimajor42
            </CopyTextButton>{" "}
            on Discord
          </li>
        </ul>
      </Container>
    </Container>
  );
}

export function Bomb() {
  if (urlParams.has("bomb")) throw new Error("nah, I dont feel like rendering");
  return null;
}
