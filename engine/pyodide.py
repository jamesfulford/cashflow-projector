from datetime import date
import dateutil.parser
from dateutil.relativedelta import relativedelta

from .exe_context import ExecutionParameters, ExecutionRules, ExecutionContext
from .generate_instances import get_transactions_up_to
from .daybydays import generate_daybydays

def get_transactions(rules, parameters):
    parameters = make_execution_parameters(parameters.to_py())
    rules = make_execution_rules(rules.to_py())
    context = ExecutionContext(parameters, rules)
    context.assert_valid()  # because we might calculate a new end date

    # Calculate transactions
    transactions = get_transactions_up_to(context)
    results = list(map(lambda i: {
        **i.serialize(),
        "name": rules.rules_map[i.rule_id]["name"],
    }, transactions))
    return {
        "transactions": results,
        "params": context.serialize()
    }

def process_daybydays(rules, parameters):
    parameters = make_execution_parameters(parameters.to_py())
    rules = make_execution_rules(rules.to_py())

    context = ExecutionContext(parameters, rules)
    context.assert_valid()  # because we might calculate a new end date

    # Calculate daybydays
    daybydays = generate_daybydays(context)

    return {
        "daybydays": list(map(lambda d: {
            **d,
            "date": d['date'].isoformat()
        }, daybydays)),
        "params": context.serialize(),
    }


def compute_context_parameters(rules, parameters):
    parameters = make_execution_parameters(parameters.to_py())
    rules = make_execution_rules(rules.to_py())

    context = ExecutionContext(parameters, rules)
    context.assert_valid()  # because we might calculate a new end date
    return {
        "params": context.serialize(),
    }


def make_execution_parameters(parameters) -> ExecutionParameters:
    """
    Extracts execution parameters from request
    """
    start = parameters.get('startDate', '')
    if start:
        start = dateutil.parser.parse(start).date()
    else:
        start = date.today()
    
    # end
    end = parameters.get('endDate', '')
    if end:
        end = dateutil.parser.parse(end).date()
    else:
        end = start + relativedelta(months=12)
    
    current = parameters.get('currentBalance', '0')
    if current:
        current = round(float(current), 2)
    else:
        current = 0
    
    set_aside = parameters.get('setAside', '0')
    if set_aside:
        set_aside = round(float(set_aside), 2)
    else:
        set_aside = 0
    
    should_calculate_high_low = "highLow" in parameters

    parameters = ExecutionParameters(
        start,
        end,
        current,
        set_aside,
        should_calculate_high_low,
    )
    parameters.assert_valid()

    return parameters

def make_execution_rules(rules) -> ExecutionRules:
    """
    Converts serialized rules from database into ExecutionRules object
    """
    rule_map = {}

    for rule in rules:
        rule_map[rule['id']] = {
            "name": rule["name"],
            "rule": rule['rrule'],
            "value": float(rule['value']),
            "labels": rule['labels']
        }
    
    rules = ExecutionRules(rule_map)
    rules.assert_valid()
    return rules