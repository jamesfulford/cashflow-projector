export type IFlags = {
  highLowEnabled: boolean;
};

export class FlagApiService {
  public async fetchDayByDays(): Promise<IFlags> {
    // TODO: get a feature flag service for the front-end.
    return {
      highLowEnabled: false,
    };
  }
}

export const FlagService = new FlagApiService();
