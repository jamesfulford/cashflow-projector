import Container from "react-bootstrap/Container";

const year = new Date().getFullYear();

export const Footer = () => {
  return (
    <Container
      fluid
      className="pt-2 footer"
      style={{ height: "5vh", borderTop: "1px solid rgb(220, 220, 220)" }}
    >
      <Container className="text-center text-secondary">
        Your data is saved in your browser in "local storage", which most
        browsers will clear when you clear cookies. &#169;{" "}
        <a
          href="https://jamesfulford.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          James Fulford
        </a>{" "}
        2018-{year}
      </Container>
    </Container>
  );
};
