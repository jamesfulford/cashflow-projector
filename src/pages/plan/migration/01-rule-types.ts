import {
  ExceptionalTransaction,
  IApiRule,
  RuleType,
} from "../../../store/rules";
import { migrateExceptionalTransactionToRequired } from "./utils/required-exceptional-transactions";

// Migration notes:
//
// v1: type is income | expense | transactions list
// income, expense are recurring. exceptionalTransactions have optional name, value
// transactions list not recurring; has no value, no rrule. exceptionalTransactions have required name, value.
//

// at first: no `type` field at all; if .rrule exists, is recurring; else list.
interface RuleOriginal {
  id: string;
  name: string;
  value: number;
  rrule?: string;

  exceptionalTransactions?: {
    id: string;
    day: string;
    name?: string; // override
    value?: number; // override
  }[]; // was added quietly at some point
}

// then: `type` field is either income or expense; we do math to categorize lists as one or the other at migration time
interface RuleV0 extends RuleOriginal {
  type?: "income" | "expense";
}

export function migrateToVersion1RuleSchema(_r: IApiRule): IApiRule {
  // _r is possibly unmigrated
  // if already migrated, do not change.
  if (_r.version && _r.version >= 1) return _r;

  // Not migrated.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = _r as any as RuleV0;

  // if .rrule exists, is recurring
  if (r.rrule) {
    return {
      id: r.id,
      name: r.name,
      version: 1,

      type: r.value > 0 ? RuleType.INCOME : RuleType.EXPENSE,
      rrule: r.rrule,
      value: r.value,
      exceptionalTransactions: r.exceptionalTransactions ?? [],
    };
  } else {
    return {
      id: r.id,
      name: r.name,
      version: 1,

      type: RuleType.TRANSACTIONS_LIST,
      exceptionalTransactions: (
        (r.exceptionalTransactions ?? []) as ExceptionalTransaction[]
      ).map(migrateExceptionalTransactionToRequired),
    };
  }
}
