import { IParameters } from "../store/reducers/parameters";

type IApiParameters = Omit<IParameters, "endDate">;

export class ParameterApiService {
  public async fetchParameters(): Promise<IApiParameters> {
    return JSON.parse(
      localStorage.getItem("parameters") ||
        JSON.stringify({
          currentBalance: 2000,
          setAside: 1000,
          startDate: new Date().toISOString().split("T")[0],
        }),
    );
  }

  public async setParameters(
    parameters: Partial<IApiParameters>,
  ): Promise<IApiParameters> {
    const currentParameters = await this.fetchParameters();
    const newParameters = {
      ...currentParameters,
      ...parameters,
    };
    localStorage.setItem("parameters", JSON.stringify(newParameters));
    return newParameters;
  }
}

export const ParameterService = new ParameterApiService();
