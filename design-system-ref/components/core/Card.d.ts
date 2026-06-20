import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** `solid` app surface, `glass` frosted marketing card, `ink` dark panel. @default "solid" */
  variant?: "solid" | "glass" | "ink";
  /** Inner padding in px. @default 20 */
  padding?: number;
  style?: React.CSSProperties;
}

/**
 * Surface container.
 * @startingPoint section="Core" subtitle="Solid, glass & ink surfaces" viewport="700x240"
 */
export function Card(props: CardProps): JSX.Element;
