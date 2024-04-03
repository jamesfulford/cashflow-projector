import { useFormikContext } from "formik";
import { IApiRuleMutate } from "../../../../store/rules";
import { convertWorkingStateToApiRuleMutate } from "./translation";
import { WorkingState } from "./types";

export function useCurrentRule(): IApiRuleMutate | undefined {
  const form = useFormikContext();

  try {
    return convertWorkingStateToApiRuleMutate(
      form.getFieldMeta("").value as WorkingState,
    );
  } catch {
    console.warn(
      "Was not able to convert to rule",
      form.getFieldMeta("").value,
    );
  }
}
