export interface IParameters {
  currentBalance: number;
  setAside: number;
  startDate: string;
}

export class ParameterApiService {
  public fetchParameters(): IParameters {
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

  public setParameters(parameters: Partial<IParameters>): IParameters {
    const currentParameters = this.fetchParameters();
    const newParameters = {
      ...currentParameters,
      ...parameters,
    };
    localStorage.setItem("parameters", JSON.stringify(newParameters));
    return newParameters;
  }
}

export const ParameterService = new ParameterApiService();
