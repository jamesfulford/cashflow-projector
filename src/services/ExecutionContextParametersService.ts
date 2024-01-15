import { IParameters } from "./ParameterService";
import { IApiRule } from "./RulesService";
import { getGlobal } from "./pyodide";

export interface ExecutionContextParameters extends IParameters {
  endDate: string;
  minimumEndDate?: string;
}

export class ExecutionContextParametersApiService {
  public async getExecutionContextParameters(
    rules: IApiRule[],
    params: IParameters,
  ): Promise<ExecutionContextParameters> {
    const handle = getGlobal("compute_context_parameters");
    const response = handle(rules, params).toJs({
      dict_converter: Object.fromEntries,
    });

    return response.params as ExecutionContextParameters;
  }
}

export const ExecutionContextParametersService =
  new ExecutionContextParametersApiService();
