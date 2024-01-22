import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import { useCallback } from "react";

export const ClearLocalStorageModal = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
}) => {
  const eraseData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);
  const closeModal = useCallback(() => {
    setShow(false);
  }, [setShow]);
  return (
    <Modal
      show={show}
      onHide={() => {
        closeModal();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Are you sure you want to erase your data?</Modal.Title>
      </Modal.Header>
      <Modal.Body>This action cannot be undone.</Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={() => {
            closeModal();
          }}
        >
          No
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            eraseData();
            closeModal();
          }}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
