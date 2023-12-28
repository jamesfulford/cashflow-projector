import React from "react";
import Container from "react-bootstrap/Container";

const year = new Date().getFullYear();

export const Footer = () => {
  return (
    <Container fluid className="mt-3 footer">
      <Container className="text-center">
        Solomon, by
        <a
          href="https://jamesfulford.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          James Fulford
        </a>
        . &#169; 2020-{year}
      </Container>
    </Container>
  );
};
