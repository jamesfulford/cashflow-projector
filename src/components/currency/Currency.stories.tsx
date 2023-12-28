import React from "react";
import { Story, Meta } from "@storybook/react";

import { Currency, CurrencyProps } from "./Currency";

export default {
  title: "Currency",
  component: Currency,
  argTypes: {
    value: { control: "number" },
  },
} as Meta;

const Template: Story<CurrencyProps> = (args: CurrencyProps) => (
  <Currency {...args} />
);

export const Zero = Template.bind({});
Zero.args = {
  value: 0,
};

export const Positive = Template.bind({});
Positive.args = {
  value: 42.4,
};

export const Negative = Template.bind({});
Negative.args = {
  value: -12.1,
};

export const NegativeRound = Template.bind({});
NegativeRound.args = {
  value: -12,
};
