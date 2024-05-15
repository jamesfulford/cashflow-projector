import {
  ExceptionalTransaction,
  RequiredExceptionalTransaction,
} from "../../../../store/rules";

export function migrateExceptionalTransactionToRequired(
  et: ExceptionalTransaction,
): RequiredExceptionalTransaction {
  return {
    // set default values; are now required.
    name: "",
    value: 0,
    ...et,
  };
}
