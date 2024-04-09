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
          Achieve <strong>Financial Peace</strong> through the power of{" "}
          <strong>Intentionality</strong>.
        </p>
        <p>
          We believe that through <strong>visualizing the future</strong>,{" "}
          <strong>planning ahead</strong>, and
          <strong>confronting past decisions</strong>, anyone can start making
          better financial decisions.
        </p>
        <p>How do we do this? We help you:</p>
        <ol>
          <li>Recognize "death spirals" visually</li>
          <li>Do the math on what lifestyle changes mean instantly</li>
          <li>Avoid overdraft fees (by planning ahead) quickly</li>
          <li>Build and protect your emergency fund nicely</li>
          <li>Identify consequential past decisions effortlessly</li>
          <li>Evaluate potential futures effectively</li>
        </ol>
        <hr />
        <p>
          <strong>What about other budgeting apps?</strong> Unlike other apps
          like Rocket Finance, YNAB, Every Dollar, or Credit Karma, we aren't
          obsessed with your past and blind to your future. We take a
          forward-looking approach. We call it{" "}
          <strong>visionary budgeting</strong>.
        </p>
        <p>
          So, use your other budgeting app! They'll do great at helping you see
          where your past money went (and even help you decide where to spend
          next). But when that app asks what your plan is for next month, come
          back here to plan ahead. Because no month is the same, but you do know
          a fair amount about what's coming in the future.
        </p>
        <hr />
        <p>
          <strong>About the developer</strong>. I'm James Fulford. In 2018, my
          finances had a lot to do between a huge grad school tuition bill and
          various loans. I had a good income and knew I could pay things off
          soon, but the tools I had couldn't help me plan more than 1 month
          ahead. So, I wrote some code to project how much I could put toward my
          loans now and still afford my regular expenses and tuition months
          later. <strong>I was thrilled I could see where I was headed.</strong>{" "}
          I felt like a captain charting a course. I felt in control of my
          financial future.
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
            <strong>Use this product every month</strong>. Monthly Active Users
            is a key metric I would present on my resume. (that's the only sense
            in which you are the product)
          </li>
          <li>
            <strong>Tell others</strong> about this product. (if you don't want
            to, let me know what's holding you back!)
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
            after achieving financial peace, what are your financial goals, and
            are you interested in knowing how soon you could achieve them?
          </li>
          <li>
            if you use credit cards for expenses, are you finding anything
            frustrating with this application?
          </li>
          <li>
            if your income is irregular, what do you think could be done to help
            make this application more helpful?
          </li>
          <li>
            what kind of expenses (or groups of expenses) do you tend to have?
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
