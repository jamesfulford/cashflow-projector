import Navbar from "react-bootstrap/Navbar";

export const Header = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand style={{ fontSize: 22 }}>
        <span role="img" aria-label="Crown Logo" className="mr-2">
          👑
        </span>
        Solomon
      </Navbar.Brand>
    </Navbar>
  );
};
