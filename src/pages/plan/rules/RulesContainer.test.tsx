import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";

import { RulesContainer } from "./RulesContainer";

import {
  setName,
  setValue,
  selectFrequency,
  setDayOfMonth,
} from "./formUtils.test";
import { RRule } from "rrule";
import { IApiRule, RulesService } from "../../../services/RulesService";

jest.mock("react-redux");
import { storeCreator } from "../../../store";
import {
  RequestStatus,
  setRules,
  setRuleStatus,
} from "../../../store/reducers/rules/actions";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../store/reducers";

describe("rules container", () => {
  let element: ReturnType<typeof render>;

  let dispatch: jest.MockedFunction<
    ReturnType<typeof storeCreator>["dispatch"]
  >;
  function setUp(
    rules?: IApiRule[],
    loading: boolean = false,
    error: boolean = false,
  ) {
    const store = storeCreator();
    if (rules) {
      store.dispatch(setRules(rules, { replace: true }));
      store.dispatch(setRuleStatus(RequestStatus.STABLE));
    }
    if (loading) {
      store.dispatch(setRuleStatus(RequestStatus.LOADING));
    }
    if (error) {
      store.dispatch(setRuleStatus(RequestStatus.ERROR));
    }

    (
      useSelector as jest.MockedFunction<(fn: (state: AppState) => any) => void>
    ).mockImplementation((selector) => selector(store.getState()));
    dispatch = jest.fn();
    (
      useDispatch as jest.MockedFunction<() => typeof store.dispatch>
    ).mockReturnValue(dispatch);

    element = render(<RulesContainer />);
  }

  function noRulesFound() {
    try {
      return element.getByTestId("no-rules-found");
    } catch (e) {
      return undefined;
    }
  }

  function rulesLoadError() {
    try {
      return element.getByTestId("rules-load-error");
    } catch (e) {
      return undefined;
    }
  }

  function rulesLoading() {
    try {
      return element.getByTestId("rules-loading");
    } catch (e) {
      return undefined;
    }
  }

  it("should have a working test framework", () => {
    expect(true).toBe(true);
  });

  it("should render form", () => {
    setUp();
    const submitButton = element.getByText("+");
    expect(submitButton).toBeInTheDocument();
  });

  describe("list rules", () => {
    it("should show no rule message if list is empty", () => {
      setUp([]);

      expect(noRulesFound()).toBeDefined();
      expect(rulesLoading()).not.toBeDefined();
      expect(rulesLoadError()).not.toBeDefined();
    });

    it("should show loading symbol when loading", () => {
      setUp(undefined, true);

      expect(noRulesFound()).not.toBeDefined();
      expect(rulesLoading()).toBeDefined();
      expect(rulesLoadError()).not.toBeDefined();
    });

    it("should show error symbol when error", () => {
      setUp(undefined, false, true);
      expect(noRulesFound()).not.toBeDefined();
      expect(rulesLoading()).not.toBeDefined();
      expect(rulesLoadError()).toBeDefined();
    });

    it("should list all rules", () => {
      setUp([
        {
          id: "test-id-rent",
          name: "Rent",
          userid: "test",
          rrule: "adsf",
          value: -1000,
        },
        {
          id: "test-id-grocery",
          name: "Grocery",
          userid: "test",
          rrule: "adsf",
          value: -500,
        },
      ]);
      expect(noRulesFound()).not.toBeDefined();
      expect(rulesLoading()).not.toBeDefined();
      expect(rulesLoadError()).not.toBeDefined();

      const ruleElements: any[] = Array.from(
        element.container.querySelectorAll(".ruledescription"),
      );
      expect(ruleElements).toHaveLength(2);
      expect(ruleElements[0].textContent).toContain("Rent");
      expect(ruleElements[1].textContent).toContain("Grocery");
    });
  });

  describe("delete rules", () => {
    it("should delete and refetch list when delete button is clicked", async () => {
      setUp([
        {
          id: "test-id-rent",
          name: "Rent",
          userid: "test",
          rrule: "FREQ=WEEKLY;INTERVAL=1;COUNT=4",
          value: -1000,
        },
      ]);

      const listItem = element.getByText(/Rent/i);
      fireEvent.click(listItem);

      waitForDomChange({ element });

      dispatch.mockClear();

      // Ensure delete button calls dispatch
      const deleteButton = element.getByText(/Delete/i);
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);

      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("create rules", () => {
    it.skip("should post new rule to backend and refetch when form is submitted", async () => {
      setUp([]);

      setName(element, "Rent");
      setValue(element, -1000.1);

      selectFrequency(element, RRule.MONTHLY);
      setDayOfMonth(element, 15);

      dispatch.mockClear();
      const submitButton = element.getByText(/Create/i);
      expect(submitButton).toBeInTheDocument();
      fireEvent.click(submitButton);
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("modify existing rule", () => {
    it.skip("should put a rule with an existing id to backend and refetch when form is submitted", async () => {
      setUp([
        {
          id: "test-id-rent",
          name: "Rent",
          userid: "test",
          rrule: "FREQ=WEEKLY;COUNT=4",
          value: -1000,
        },
      ]);

      const listItem = element.getByText(/Rent/i);
      fireEvent.click(listItem);

      waitForDomChange({ element });
      setName(element, "Rent 1");

      dispatch.mockResolvedValue();

      const updateButton = element.getByText(/Update/i);
      fireEvent.click(updateButton);

      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
