import Container from "react-bootstrap/esm/Container";
import Spinner from "react-bootstrap/esm/Spinner";

export const Loading = () => {
  return (
    <Container className="justify-content-middle text-center mt-5 mb-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );
};
