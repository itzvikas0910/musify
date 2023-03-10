import React, { PropsWithChildren } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Carousel from "../components/Carousel";
import { number, withKnobs } from "@storybook/addon-knobs";

export default {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: { control: "text" },
    gap: { control: "number" },
  },
  decorators: [withKnobs],
} as ComponentMeta<typeof Carousel>;

const Box = ({ children }: PropsWithChildren) => (
  <div
    style={{
      minWidth: `${number("Box Width", 200, {
        range: true,
        min: 0,
        max: 1000,
      })}px`,
      height: "200px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(0, 0, 0, 0.3)",
    }}
  >
    {children}
  </div>
);

const Template: ComponentStory<typeof Carousel> = (args) => {
  const getBoxes = (totalBoxes: number) =>
    Array.from({ length: totalBoxes }).map((_, i) => (
      <Box key={i}>{`Box ${i + 1}`}</Box>
    ));
  return (
    <div
      style={{
        padding: "2em",
        background: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <Carousel {...args}>{getBoxes(number("Total boxes", 50))}</Carousel>
    </div>
  );
};

export const Boxes = Template.bind({});
Boxes.args = {
  title: "The best carousel",
  gap: 24,
};
