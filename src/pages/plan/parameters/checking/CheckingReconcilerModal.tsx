import Modal from "react-bootstrap/esm/Modal";
import { SavingsGoalsReviewSection } from "./reconcile/SavingsGoalsReviewSection";
import { TransactionsReviewSection } from "./reconcile/TransactionsReviewSection";
import { UpdateBalanceSection } from "./reconcile/UpdateBalanceSection";

export const CheckingReconcilerModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  return (
    <Modal show onHide={onClose} keyboard size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Let's catch up.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TransactionsReviewSection onClose={onClose} />
        <hr />

        <SavingsGoalsReviewSection />
        <hr />

        <UpdateBalanceSection onClose={onClose} />
      </Modal.Body>
    </Modal>
  );
};
