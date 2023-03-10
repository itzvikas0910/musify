import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import ExplicitSign from "../components/ExplicitSign";

export default {
  title: "Components/ExplicitSign",
  component: ExplicitSign,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ExplicitSign>;

const Template: ComponentStory<typeof ExplicitSign> = () => {
  return (
    <div
      style={{
        padding: "2em",
        background: "rgba(0, 0, 0, 0.9)",
      }}
    >
      <ExplicitSign />
    </div>
  );
};

export const Default = Template.bind({});
