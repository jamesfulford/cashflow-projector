import React from "react";
import { Story, Meta } from "@storybook/react";

import { AddEditRuleForm, AddEditRuleFormProps } from "./AddEditRule";

export default {
  title: "AddEditRuleForm",
  component: AddEditRuleForm,
  argTypes: {},
} as Meta;

const Template: Story<AddEditRuleFormProps> = (args: AddEditRuleFormProps) => (
  <AddEditRuleForm {...args} />
);

export const Pristine = Template.bind({});
Pristine.args = {};

export const Editing = Template.bind({});
Editing.args = {
  rule: {
    name: "Groceries",
    rrule: "FREQ=WEEKLY;INTERVAL=1;BYDAY=SU",
    value: -120,
  },
};

export const PristineWithHighLow = Template.bind({});
PristineWithHighLow.args = {
  highLowEnabled: true,
};

export const EditingWithHighLow = Template.bind({});
EditingWithHighLow.args = {
  rule: {
    name: "Groceries",
    rrule: "FREQ=WEEKLY;INTERVAL=1;BYDAY=SU",
    value: -120,
  },
  highLowEnabled: true,
};
