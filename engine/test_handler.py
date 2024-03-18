import unittest
from datetime import date
from dateutil.rrule import rrule, YEARLY
from .exe_context import ExecutionParameters, ExecutionRules, ExecutionContext
from .generate_instances import get_transactions_up_to
from .daybydays import generate_daybydays


def get_transactions(parameters, rules):
    transactions = get_transactions_up_to(ExecutionContext(parameters, rules))
    return list(map(lambda i: i.serialize(), transactions))

def get_daybyday(parameters, rules):
    daybydays = generate_daybydays(ExecutionContext(parameters, rules))
    def convert_dbd(d):
        d['date'] = d['date'].isoformat()
        return d
    return list(map(convert_dbd, daybydays))

import json

def get_parameters_from_inputs(inputs):
    return ExecutionParameters(date.fromisoformat(inputs['parameters']["startDate"]), date.fromisoformat(inputs['parameters']["endDate"]), inputs['parameters']['currentBalance'], inputs['parameters']['setAside'])

def get_rules_from_inputs(inputs):
    rulemap = {}
    for rule in inputs['rules']:
        rulemap[rule["name"]] = {
            "rule": rule["rrule"],
            "value": rule["value"]
        }
    return ExecutionRules(rulemap)

def get_inputs(i):
    with open(f'engine/test-data/{i}/inputs.json') as f:
        return json.load(f)

def get_expected_transactions(i):
    with open(f'engine/test-data/{i}/transactions.json') as f:
        return json.load(f)
    
def get_expected_daybydays(i):
    with open(f'engine/test-data/{i}/daybydays.json') as f:
        return json.load(f)
    
class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.maxDiff = 5000

    def test_get_instances_from_rules_monthly(self):
        inputs = get_inputs(1)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(1)
        self.assertEqual(expected, actual)

    def test_get_instances_from_rules_multipleRules(self):
        inputs = get_inputs(2)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(2)
        self.assertEqual(expected, actual)
    
    def test_get_instances_from_rules_weekly(self):
        inputs = get_inputs(3)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(3)
        self.assertEqual(expected, actual)
    

    def test_get_instances_from_rules_biweekly(self):
        inputs = get_inputs(4)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(4)
        self.assertEqual(expected, actual)

    def test_get_instances_from_rules_yearly(self):
        inputs = get_inputs(5)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(5)
        self.assertEqual(expected, actual)
    
    def test_get_instances_from_rules_once(self):
        inputs = get_inputs(6)
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_transactions(6)
        self.assertEqual(expected, actual)

    def test_get_daybyday_from_rules_once(self):
        inputs = get_inputs(7)
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_daybydays(7)
        self.assertEqual(expected, actual)
    

    def test_use_latest_rrule_for_end_date(self):
        actual = get_daybyday(
            ExecutionParameters(
                date(2018, 6, 20),
                date(2018, 6, 22),
                0,
                0
            ),
            ExecutionRules({
                'rule-1': {
                    "rule": str(rrule(freq=YEARLY, count=1, dtstart=date(2018, 7, 21))),
                    "value": 100
                }
            })
        )
        self.assertEqual("2018-07-22", actual[-1]["date"])


    def test_get_daybyday_from_rules_multipleRules(self):
        inputs = get_inputs(8)
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_daybydays(8)
        self.assertEqual(expected, actual)

    def test_get_daybyday_from_rules_weekly(self):
        inputs = get_inputs(9)
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_daybydays(9)
        self.assertEqual(expected, actual)


    def test_get_daybyday_from_rules_daily(self):
        inputs = get_inputs(10)
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_daybydays(10)
        self.assertEqual(expected, actual)


    def test_get_daybyday_from_rules_monthly(self):
        inputs = get_inputs(11)
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = get_expected_daybydays(11)
        self.assertEqual(expected, actual)