import unittest
from datetime import date
from .exe_context import ExecutionParameters, ExecutionRules, ExecutionContext
from .generate_instances import get_transactions_up_to


def get_transactions(parameters, rules):
    transactions = get_transactions_up_to(ExecutionContext(parameters, rules))
    return list(map(lambda i: i.serialize(), transactions))

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
    
class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.maxDiff = None
    
    def assert_transactions(self, i):
        inputs = get_inputs(i)
        self.assertEqual(get_expected_transactions(i), get_transactions(
            get_parameters_from_inputs(inputs),
            get_rules_from_inputs(inputs)
        ))
    
    def test_get_instances_from_rules_monthly(self):
        self.assert_transactions(1)

    def test_get_instances_from_rules_multipleRules(self):
        self.assert_transactions(2)
    
    def test_get_instances_from_rules_weekly(self):
        self.assert_transactions(3)
    

    def test_get_instances_from_rules_biweekly(self):
        self.assert_transactions(4)

    def test_get_instances_from_rules_yearly(self):
        self.assert_transactions(5)
    
    def test_get_instances_from_rules_once(self):
        self.assert_transactions(6)
