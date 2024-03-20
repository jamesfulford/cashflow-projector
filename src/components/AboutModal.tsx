import Modal from "react-bootstrap/esm/Modal";
import { useCallback } from "react";

const year = new Date().getFullYear();

export const AboutModal = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (newValue: boolean) => void;
}) => {
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
        <Modal.Title>About Cashflow Projector</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Visionary Budgeting</strong>. Look into your financial future
          based on your current trajectory.
        </p>
        <p>
          Plenty of tools exist for tracking how well you stick to a budget,
          like Mint, Rocket Finance, or Every Dollar. But how am I supposed to
          decide what my budget should be?
        </p>
        <p>
          I'm James Fulford. I made this for myself originally so I could plan
          for big expenses (for me, tuition) and pay off my car loan as soon as
          I could. While Mint helped me make sure I stuck to my plan, it did not
          help me <em>make</em> a plan. All the tools I could find were monthly,
          but I knew I had to save for several months to pay for tuition and
          wasn't sure how to plan ahead for that. I wanted to be sure that I
          would have the money available, and that I wouldn't have too much
          money doing nothing while interest accrued on my car loan.{" "}
          <strong>I needed to see the future</strong>. I needed visionary
          budgeting.
        </p>
        <p>
          I started writing this in June of 2018. Within a year of using this
          tool and following Dave Ramsey's Baby Steps, I was debt-free.
        </p>
        <p>
          Years later, I found I was still using this tool regularly to plan for
          big expenses and stay out of debt. I made a prototype and put it in
          front of friends, family, and classmates, and they had good feedback
          and found it useful too. I hope you find it useful too!
        </p>
        <p>
          <strong>The detailed journey</strong>. I wrote this (while listening
          to Dave Ramsey) in Python with Excel as my inputs and outputs. After a
          brief attempt to get the code to run in a serverless cloud function (I
          found serverless.com was slow to work with at the time and AWS API
          Gateway wasn't cheap), I re-wrote it with some classmates for a school
          project with Django + React (and called it "Moneywise"). We had an
          API-first approach and used Auth0 for authentication. After the final
          presentation, I deployed on DigitalOcean (and called it
          "Solomon.money" after the wise and wealthy king of ancient Israel). I
          was afraid to put it in front of real users (long story), so I shut it
          down to save money on hosting. In 2023, I got over my fear, scrapped
          the backend, and made the application "local-first" to avoid having
          access to peoples' sensitive financial data and to save money on
          hosting while in beta. Now, it lives on as Cashflow Projector.
        </p>
        <p>
          &#169;{" "}
          <a
            href="https://jamesfulford.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            James Fulford
          </a>{" "}
          2018-{year}, all rights reserved.
        </p>
      </Modal.Body>
    </Modal>
  );
};
