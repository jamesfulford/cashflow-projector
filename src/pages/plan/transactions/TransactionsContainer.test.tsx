import React from "react";
import { render } from "@testing-library/react";

import { TransactionsContainer } from "./TransactionsContainer";

import { useSelector } from "react-redux";
import { storeCreator } from "../../../store";
import {
  RequestStatus,
  setTransactions,
  setTransactionsStatus,
} from "../../../store/reducers/transactions";
import { IApiTransaction } from "../../../services/TransactionsService";
import { AppState } from "../../../store/reducers";

jest.mock("react-redux");

describe("transactions container", () => {
  let element: ReturnType<typeof render>;

  function setUp(
    transactions?: IApiTransaction[],
    loading: boolean = false,
    error: boolean = false,
  ) {
    const store = storeCreator();
    if (transactions) {
      store.dispatch(setTransactions(transactions));
      store.dispatch(setTransactionsStatus(RequestStatus.STABLE));
    }
    if (loading) {
      store.dispatch(setTransactionsStatus(RequestStatus.LOADING));
    }
    if (error) {
      store.dispatch(setTransactionsStatus(RequestStatus.ERROR));
    }
    (
      useSelector as jest.MockedFunction<(fn: (state: AppState) => any) => void>
    ).mockImplementation((selector) => selector(store.getState()));
    element = render(<TransactionsContainer />);
  }

  function transactionsEmpty() {
    try {
      return element.getByTestId("transactions-empty");
    } catch (e) {
      return undefined;
    }
  }

  function transactionsError() {
    try {
      return element.getByTestId("transactions-error");
    } catch (e) {
      return undefined;
    }
  }

  function transactionsLoading() {
    try {
      return element.getByTestId("transactions-loading");
    } catch (e) {
      return undefined;
    }
  }

  function transactionsShowing() {
    try {
      return element.getByTestId("transactions-showing");
    } catch (e) {
      return undefined;
    }
  }

  it("should render an empty list", () => {
    setUp([]);
    expect(element).toBeDefined();
  });

  describe("list transactions", () => {
    it("should show no transactions message if list is empty", () => {
      setUp([]);

      expect(transactionsEmpty()).toBeDefined();
      expect(transactionsLoading()).not.toBeDefined();
      expect(transactionsError()).not.toBeDefined();
    });

    it("should show loading symbol when loading", () => {
      setUp(undefined, true);

      expect(transactionsError()).not.toBeDefined();
      expect(transactionsLoading()).toBeDefined();
      expect(transactionsShowing()).not.toBeDefined();
    });

    it("should show error symbol when error", () => {
      setUp(undefined, false, true);
      expect(transactionsEmpty()).not.toBeDefined();
      expect(transactionsLoading()).not.toBeDefined();
      expect(transactionsError()).toBeDefined();
    });

    it("should list all transactions", () => {
      setUp([
        {
          rule_id: "Rent",
          name: "Rent",
          id: "rent-1",
          value: -2000,
          day: "1970-01-01",
          calculations: {
            balance: 1337,
            working_capital: 1000,
          },
        },
        {
          rule_id: "Paycheck",
          name: "Paycheck",
          id: "paycheck-1",
          value: 2000,
          day: "1970-01-05",
          calculations: {
            balance: 3337,
            working_capital: 1000,
          },
        },
      ]);
      expect(transactionsEmpty()).not.toBeDefined();
      expect(transactionsLoading()).not.toBeDefined();
      expect(transactionsError()).not.toBeDefined();

      const transactionElements: any[] = Array.from(
        element.container.querySelectorAll("tbody > tr"),
      );
      expect(transactionElements).toHaveLength(2);
      expect(transactionElements[0].textContent).toContain("Rent");
      expect(transactionElements[1].textContent).toContain("Paycheck");
    });

    it("should not list over 50 transactions at once", () => {
      // Create 60 transactions (more than 50)
      const transactions: IApiTransaction[] = Array.from([...Array(60)])
        .map((_, i) => i)
        .map((i) => ({
          rule_id: `Rule #${i}`,
          name: `Rule #${i}`,
          id: `Rule id #${i}`,
          value: 1000,
          day: "1970-01-02",
          calculations: {
            balance: 123,
            working_capital: 121323,
          },
        }));

      setUp(transactions);
      expect(transactionsEmpty()).not.toBeDefined();
      expect(transactionsLoading()).not.toBeDefined();
      expect(transactionsError()).not.toBeDefined();
      const transactionElements: any[] = Array.from(
        element.container.querySelectorAll("tbody > tr"),
      );
      expect(transactionElements).toHaveLength(50); // not 60, 50.
    });
  });
});
