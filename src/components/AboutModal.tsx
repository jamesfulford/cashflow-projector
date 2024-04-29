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
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>About Cashflow Projector</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>About the developer</strong>. I'm James Fulford. In 2018, my
          finances had a lot to do between a huge grad school tuition bill and
          various loans. I had a good income and knew I could pay things off
          soon, but the tools I had couldn't help me plan more than 1 month
          ahead. So, I wrote some code to project how much I could put toward my
          loans now and still afford my regular expenses and tuition months
          later. I was thrilled I could see where I was headed. I felt like a
          captain charting a course. I felt in control of my financial future.
        </p>
        <p>
          While the budgeting tool Mint (now Credit Karma) helped me make sure I
          was following my plan, I logged into my tool frequently so I could see
          where I was headed and change my plans as new information came up.
        </p>
        <p>Before I knew it, I was debt free.</p>
        <p>
          As a software engineer, many projects I work on don't see the light of
          day (whether for work, school, or as a hobby). This was the only
          project that I saw make an impact, and the only project I found useful
          over the course of multiple years. So, I decided to make it available
          for anyone to use.
        </p>
        <hr />
        <p>
          <strong>Goals</strong>. My motivations for building this product are
          many-fold.
        </p>
        <ol>
          <li>
            Friends. I wanted to help friends, including my sister, with their
            finances. I saw this make such a difference for me and I wanted them
            to experience that financial peace too.
          </li>
          <li>
            Resume. Most software engineers build portfolio projects that no one
            uses. Having <i>actual users</i> and shipping an entire product is
            way more impressive to employers than just doing what you are told.
          </li>
          <li>
            Premium features (eventually). The core of the product will remain
            free. However, some features (especially ones that have costs
            associated with them, like servers) may be put behind a paywall.
            Syncing across devices, multiplayer support, and email reminders are
            a few features I am considering.
          </li>
        </ol>
        <p>
          You are not the product; your data is not collected and sold,
          including your financial numbers and email address. I may show ads in
          the future, but would do so in a classy way. However, my main goal is
          to get a better job by proving myself to be a good product developer.
        </p>
        <p>The best ways you can help with my goal are:</p>
        <ol>
          <li>
            Use this product every month. Monthly Active Users is a key metric I
            would present on my resume. (that's the only sense in which you are
            the product)
          </li>
          <li>
            Tell others about this product. (if you don't want to, let me know
            what's holding you back!)
          </li>
          <li>
            Send me constructive feedback. (if you want to talk instead of
            write: that's great too, just let me know.)
          </li>
          <li>
            Share your story of how this product has helped you achieve
            financial peace. (testimonials are powerful!)
          </li>
          {/* <li>
            Rate this product on TrustPilot
          </li> */}
          {/* <li>
            Sign up for our free financial advice email course
          </li> */}
        </ol>
        <hr />
        <p>
          <strong>Ideas</strong>. I've got some ideas I want your thoughts on:
        </p>
        <ul>
          <li>
            After achieving financial peace, what are your financial goals, and
            are you interested in knowing how soon you could achieve them?
          </li>
          <li>
            If you use credit cards for expenses, are you finding anything
            frustrating with this application?
          </li>
          <li>
            If your income is irregular, what do you think could be done to help
            make this application more helpful?
          </li>
          <li>
            What kind of expenses (or groups of expenses) do you tend to have?
            Are there unexpected expenses tied to those? (want to add more
            predefined expenses so others can benefit)
          </li>
        </ul>
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
