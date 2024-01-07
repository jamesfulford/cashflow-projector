import Container from "react-bootstrap/Container";

const year = new Date().getFullYear();

export const Footer = () => {
  return (
    <Container
      fluid
      className="pt-3 footer"
      style={{ height: "8vh", borderTop: "1px solid #eeeeee" }}
    >
      <Container className="text-center text-secondary">
        Your data is saved in your browser in "local storage", not on our
        servers (we don't have any!). Clearing browser cookies will likely clear
        "local storage" too.
      </Container>
      <Container className="text-center">
        <a
          href="https://jamesfulford.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          James Fulford
        </a>
        &nbsp;&#169; 2018-{year}
      </Container>
    </Container>
  );
};
