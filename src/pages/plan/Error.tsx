import Container from "react-bootstrap/esm/Container";

// TODO: just have this throw and show the backup error page
export const Error = ({ message }: { message?: string }) => {
  return (
    <Container className="justify-content-middle text-center mt-5 mb-5">
      <span className="text-danger">
        {message || "An error occurred. Please reload the page."}
      </span>
    </Container>
  );
};
