import unittest
from datetime import date
from dateutil.rrule import rrule, MONTHLY, YEARLY, WEEKLY, DAILY, MO
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
    
class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.maxDiff = 5000

    def test_get_instances_from_rules_monthly(self):
        inputs = json.load(open('engine/test-data/1/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/1/transactions.json'))
        self.assertEqual(expected, actual)

    def test_get_instances_from_rules_multipleRules(self):
        inputs = json.load(open('engine/test-data/2/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/2/transactions.json'))
        self.assertEqual(expected, actual)
    
    def test_get_instances_from_rules_weekly(self):
        inputs = json.load(open('engine/test-data/3/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/3/transactions.json'))
        self.assertEqual(expected, actual)
    

    def test_get_instances_from_rules_biweekly(self):
        inputs = json.load(open('engine/test-data/4/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/4/transactions.json'))
        self.assertEqual(expected, actual)

    def test_get_instances_from_rules_yearly(self):
        inputs = json.load(open('engine/test-data/5/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/5/transactions.json'))
        self.assertEqual(expected, actual)
    
    def test_get_instances_from_rules_once(self):
        inputs = json.load(open('engine/test-data/6/inputs.json'))
        actual = get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/6/transactions.json'))
        self.assertEqual(expected, actual)

    def test_get_daybyday_from_rules_once(self):
        inputs = json.load(open('engine/test-data/7/inputs.json'))
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/7/daybydays.json'))
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
        inputs = json.load(open('engine/test-data/8/inputs.json'))
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/8/daybydays.json'))
        self.assertEqual(expected, actual)

    def test_get_daybyday_from_rules_weekly(self):
        inputs = json.load(open('engine/test-data/9/inputs.json'))
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/9/daybydays.json'))
        self.assertEqual(expected, actual)


    def test_get_daybyday_from_rules_daily(self):
        inputs = json.load(open('engine/test-data/10/inputs.json'))
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/10/daybydays.json'))
        self.assertEqual(expected, actual)


    def test_get_daybyday_from_rules_monthly(self):
        inputs = json.load(open('engine/test-data/11/inputs.json'))
        actual = get_daybyday(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        )
        expected = json.load(open('engine/test-data/11/daybydays.json'))
        self.assertEqual(expected, actual)