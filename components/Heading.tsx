import {
  createElement,
  DetailedHTMLProps,
  HtmlHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from "react";
import type { HeadingProps } from "types/heading";
import { getHeadingStyles } from "utils/getHeadingStyles";
import css from "styled-jsx/css";

export default function Heading({
  number,
  as: element = `h${number}`,
  color,
  fontSize,
  margin,
  textAlign,
  multiline,
  children,
  ...props
}: PropsWithChildren<HeadingProps> &
  DetailedHTMLProps<
    HtmlHTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >): ReactElement {
  const { className, styles } = getHeadingStyles(number, element, {
    color,
    fontSize,
    margin,
    textAlign,
    multiline,
  });

  const defaultStyles = css.resolve`
    ${element} {
      display: -webkit-box;
      font-family: Lato, sans-serif;
      letter-spacing: -0.04em;
      line-break: anywhere;
      max-width: 100%;
      overflow: hidden;
      position: relative;
      text-overflow: ellipsis;
      text-transform: none;
      white-space: unset;
      z-index: 999999;
      -webkit-box-orient: vertical;
      width: 100%;
    }
  `;

  return (
    <>
      {createElement(
        element,
        { className: `${className} ${defaultStyles.className}`, ...props },
        children
      )}
      {defaultStyles.styles}
      {styles}
    </>
  );
}
