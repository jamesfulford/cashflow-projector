import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { DayByDayContainer } from "./DayByDayContainer";
import { storeCreator } from "../../../store";
import {
  RequestStatus,
  setDayByDays,
  setDayByDaysStatus,
} from "../../../store/reducers/daybydays";
import { IApiDayByDay } from "../../../services/DayByDayService";
import { useSelector } from "react-redux";
import { AppState } from "../../../store/reducers";

jest.mock("react-redux");

describe("daybyday container", () => {
  let element: ReturnType<typeof render>;

  function setUp(
    daybydays?: IApiDayByDay,
    loading: boolean = false,
    error: boolean = false,
  ) {
    const store = storeCreator();
    if (daybydays) {
      store.dispatch(setDayByDays(daybydays));
      store.dispatch(setDayByDaysStatus(RequestStatus.STABLE));
    }
    if (loading) {
      store.dispatch(setDayByDaysStatus(RequestStatus.LOADING));
    }
    if (error) {
      store.dispatch(setDayByDaysStatus(RequestStatus.ERROR));
    }

    (
      useSelector as jest.MockedFunction<(fn: (state: AppState) => any) => void>
    ).mockImplementation((selector) => selector(store.getState()));

    element = render(<DayByDayContainer />);
  }

  function dayByDayError() {
    try {
      return element.getByTestId("daybyday-error");
    } catch (e) {
      return undefined;
    }
  }

  function dayByDayLoading() {
    try {
      return element.getByTestId("daybyday-loading");
    } catch (e) {
      return undefined;
    }
  }

  function dayByDayEmpty() {
    try {
      return element.getByTestId("daybyday-empty");
    } catch (e) {
      return undefined;
    }
  }

  function dayByDayShowing() {
    try {
      return element.getByTestId("daybyday-showing");
    } catch (e) {
      return undefined;
    }
  }

  it("should render an empty list", () => {
    setUp({
      daybydays: [],
      params: {
        minimumEndDate: "2020-04-01",
      },
    });
    expect(element).toBeDefined();
  });

  describe("render daybydays", () => {
    it("should show no daybydays and a special message if payload is empty", () => {
      setUp({
        daybydays: [],
        params: {
          minimumEndDate: "2020-04-01",
        },
      });

      expect(dayByDayLoading()).not.toBeDefined();
      expect(dayByDayError()).not.toBeDefined();
      expect(dayByDayEmpty()).toBeDefined();
    });

    it("should show loading symbol when loading", () => {
      setUp(undefined, true);

      expect(dayByDayError()).not.toBeDefined();
      expect(dayByDayLoading()).toBeDefined();
      expect(dayByDayShowing()).not.toBeDefined();
    });

    it("should show error symbol when error", () => {
      setUp(undefined, false, true);
      expect(dayByDayLoading()).not.toBeDefined();
      expect(dayByDayError()).toBeDefined();
    });

    it("should not show entries over 2 years from now", () => {
      setUp({
        daybydays: [
          {
            date: "1970-01-01",
            balance: {
              low: 0.0,
              high: 0.0,
            },
            working_capital: {
              low: 0.0,
              high: 0.0,
            },
          },
          {
            date: "1972-01-05",
            balance: {
              low: 0.0,
              high: 234.0,
            },
            working_capital: {
              low: -1766.0,
              high: -1766.0,
            },
          },
        ],
        params: {
          minimumEndDate: "2020-04-01",
        },
      });
      expect(dayByDayLoading()).not.toBeDefined();
      expect(dayByDayError()).not.toBeDefined();
    });
  });
});
