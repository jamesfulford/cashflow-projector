/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import NavLink from "react-bootstrap/esm/NavLink";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Nav from "react-bootstrap/esm/Nav";
import NavItem from "react-bootstrap/esm/NavItem";
import Navbar from "react-bootstrap/esm/Navbar";

import { ClearLocalStorageModal } from "./ClearLocalStorageModal";
import { feedbackHref } from "./Feedback";
import { CopyTextButton } from "./CopyText";

export const Header = () => {
  const [showEraseDataModal, setShowEraseDataModal] = useState(false);

  return (
    <>
      <ClearLocalStorageModal
        show={showEraseDataModal}
        setShow={setShowEraseDataModal}
      />
      <Navbar
        expand="lg"
        style={{
          paddingLeft: 20,
          height: "5vh",
          borderBottom: "1px solid rgb(220, 220, 220)",
        }}
      >
        <Navbar.Brand>
          Cashflow Projector{" "}
          <sup className="text-primary" title="beta">
            β
          </sup>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-between"
          style={{
            paddingLeft: 60,
          }}
        >
          <Nav>
            {/* <Nav.Link>About</Nav.Link> */}
            {/* <Dropdown as={NavItem}>
            <Dropdown.Toggle as={NavLink}>File</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>New</Dropdown.Item>
              <Dropdown.Item>Open...</Dropdown.Item>
              <Dropdown.Item>Save as...</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
          </Nav>
          <Nav>
            <Dropdown as={NavItem} style={{ marginRight: 120 }}>
              <Dropdown.Toggle as={NavLink}>Support</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href={feedbackHref} target="_blank">
                  Send Feedback
                </Dropdown.Item>
                <CopyTextButton as={Dropdown.Item as any} text="@semimajor42">
                  Copy Discord ID
                </CopyTextButton>
                <Dropdown.Item
                  className="text-primary"
                  href="https://www.paypal.me/jamespfulford"
                  target="_blank"
                >
                  Donate via PayPal
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  className="text-danger"
                  onClick={() => {
                    setShowEraseDataModal(true);
                  }}
                >
                  Erase data
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};
