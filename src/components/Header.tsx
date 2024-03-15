/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import NavLink from "react-bootstrap/esm/NavLink";
import Dropdown from "react-bootstrap/esm/Dropdown";
import Nav from "react-bootstrap/esm/Nav";
import NavItem from "react-bootstrap/esm/NavItem";
import Navbar from "react-bootstrap/esm/Navbar";

import { feedbackHref } from "./Feedback";
import { CopyTextButton } from "./CopyText";
import { AboutModal } from "./AboutModal";
import { createDefaultRules } from "./createDefaultRules";
import { batchCreateRules } from "../store/rules";
import {
  isAutosaveActiveState,
  newProfile,
  openProfile,
  saveProfile,
  saveProfileAs,
} from "../store/filesystem";
import { SaveIndicator } from "./SaveIndicator";
import { useSignalValue } from "../store/useSignalValue";

export const Header = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const isAutosaveActive = useSignalValue(isAutosaveActiveState);
  return (
    <>
      <AboutModal show={showAboutModal} setShow={setShowAboutModal} />
      <Navbar
        expand="lg"
        style={{
          paddingLeft: 20,
          height: 40,
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
            <Nav.Link
              onClick={(e) => {
                e.preventDefault();
                setShowAboutModal(true);
              }}
            >
              About
            </Nav.Link>
            <Dropdown as={NavItem}>
              <Dropdown.Toggle as={NavLink}>File</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    newProfile();
                  }}
                >
                  New
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    openProfile();
                  }}
                >
                  Open
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    saveProfile();
                  }}
                  disabled={isAutosaveActive}
                >
                  {isAutosaveActive ? <>Save (autosaving)</> : <>Save</>}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    saveProfileAs();
                  }}
                >
                  Save as
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown as={NavItem}>
              <Dropdown.Toggle as={NavLink}>Edit</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    (async () => {
                      batchCreateRules(createDefaultRules());
                    })();
                  }}
                >
                  Add starter income/expenses
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
          <SaveIndicator />
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
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};
