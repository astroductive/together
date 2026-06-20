import React from "react";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** Connection / liveness state — drives the dot color & pulse. @default "idle" */
  state?: "idle" | "live" | "connecting" | "failed";
  style?: React.CSSProperties;
}

/** Status pill with a live indicator dot. */
export function Pill(props: PillProps): JSX.Element;
