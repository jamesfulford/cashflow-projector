export interface IParameters {
  currentBalance: number;
  setAside: number;
  startDate: string;
}

export class ParameterApiService {
  public async fetchParameters(): Promise<IParameters> {
    const parameters = JSON.parse(
      localStorage.getItem("parameters") ||
        JSON.stringify({
          currentBalance: 2000,
          setAside: 1000,
          startDate: new Date().toISOString().split("T")[0],
        }),
    );
    console.log("fetchParameters", { parameters });
    return parameters;
  }

  public async setParameters(
    parameters: Partial<IParameters>,
  ): Promise<IParameters> {
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
