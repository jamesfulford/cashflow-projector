import Joyride, { STATUS, Status } from "react-joyride";
// import useLocalStorage from "use-local-storage";
import { urlParams } from "../../services/url-params";

const tutorialRunOverride = urlParams.has("tutorial");

export const GuidedTutorial = () => {
  //   const [tutorialCompleted, setTutorialCompleted] = useLocalStorage(
  //     "tutorial-completed",
  //     false,
  //   );
  //   const shouldRun = !tutorialCompleted || tutorialRunOverride;
  const shouldRun = tutorialRunOverride;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTutorialCompleted = (_: boolean) => {};

  if (!shouldRun) return null;

  return (
    <Joyride
      callback={(event) => {
        if (
          ([STATUS.FINISHED, STATUS.SKIPPED] as Status[]).includes(event.status)
        ) {
          setTutorialCompleted(true);
          return;
        }
      }}
      steps={[
        {
          title: "Walkthrough",
          target: "body",
          content: `Welcome! There's a lot going on, so let's go through it one thing at a time. Ready?`,
          placement: "center",
          disableBeacon: true,
        },
        {
          title: "Current Balance",
          target: "#current-balance-input",
          content: `To start, put in your checking account balance here, plus cash and PayPal/Venmo balances. We'll start with this value when we forecast your future.`,
        },
        {
          title: "Safety net",
          target: "#safety-net-input",
          content: (
            <>
              Input here how much you want to always leave in your checking
              account in case of a minor emergency, like a flat tire or needing
              a hotel for a night.
              <br />
              <br />
              This isn't a full-blown emergency fund, but this is key for giving
              you some much-needed financial peace of mind.
            </>
          ),
        },
        {
          target: "#rules-section",
          title: "Income and Expenses",
          content: `Here is where your income and expenses live.`,
        },
        {
          target: `#rules-section [data-index="0"]`,
          title: "Recurring Expense",
          //   TODO: guarantee that we're looking at the expenses tab
          content: `Here's a recurring expense. Here you can see what percent of your income is consumed by this expense at a glance.`,
        },
        {
          target: `#rules-section [data-index="0"] [data-testid="buttons"]`,
          title: "Editing",
          content: (
            <>
              To get you started quickly, we made some assumptions about your
              situation that you should correct. You can edit, duplicate, or
              delete your expense here.
              <br />
              <br />
              <em>Tip: try double-clicking the dollar amount to quick-edit.</em>
            </>
          ),
        },
        {
          target: `#add-button`,
          title: "Adding more",
          content: `To add more income sources and expenses, select "Add" and follow the instructions.`,
        },
        {
          target: `#free-to-spend-today`,
          title: "Free to spend",
          content: (
            <>
              After forecasting how your balance will go up and down, we worked
              backwards to figure out how much of your current balance is not
              reserved for a future expense or your safety net. We call this
              your "free to spend balance."
              <br />
              <br />
              If this is negative, then consider skipping or rescheduling some
              transactions for later, or pulling some cash from savings.
            </>
          ),
        },
        {
          target: `#day-by-day-container`,
          title: "Foreseeable future",
          content: (
            <>
              Here is how your balance and free to spend balance are expected to
              change over time.
              <br />
              <br />
              This is in an upward trend, which would mean you are heading in
              the right direction!
            </>
          ),
        },
        {
          target: `#duration-selector`,
          title: "See further",
          content: <>Use this to forecast longer and shorter time frames.</>,
        },
        {
          target: `#transactions-container`,
          title: "Details",
          content: (
            <>
              These are the details of how your balance is computed. You can
              edit, reschedule, or skip individual transactions here.
            </>
          ),
        },
        {
          target: `#file-dropdown`,
          title: "Save your forecast profile",
          content: (
            <>
              Save your data to a file using this dropdown.
              <br />
              <br />
              <em>Tip: autosave is supported for Chrome, Edge, and Opera.</em>
            </>
          ),
        },
        {
          title: "All set!",
          target: "body",
          content: `If you have any questions or difficulties, just let us know using the "Support" dropdown at the top right.`,
          placement: "center",
          disableBeacon: true,
        },
      ]}
      showProgress
      showSkipButton
      continuous
      styles={{
        buttonNext: {
          backgroundColor: "var(--blue)",
        },
        buttonBack: {
          color: "var(--gray-text)",
        },
      }}
    />
  );
};
