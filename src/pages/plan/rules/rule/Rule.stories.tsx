import React from "react";
import { Story, Meta } from "@storybook/react";

import { Rule, RuleProps } from "./Rule";

export default {
  title: "Rule",
  component: Rule,
  argTypes: {},
} as Meta;

const Template: Story<RuleProps> = (args: RuleProps) => <Rule {...args} />;

export const Simple = Template.bind({});
Simple.args = {
  rule: {
    id: "1",
    userid: "a",
    name: "Rule Name",
    rrule: "FREQ=WEEKLY;INTERVAL=1;COUNT=4",
    value: 1,
  },
};

export const Selected = Template.bind({});
Selected.args = {
  rule: {
    id: "1",
    userid: "a",
    name: "Rule Name",
    rrule: "FREQ=WEEKLY;INTERVAL=1;COUNT=4",
    value: 1,
  },
  selected: true,
};
