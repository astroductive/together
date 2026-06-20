import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: "neutral" | "accent" | "sand" | "ink" | "ok" | "danger";
  style?: React.CSSProperties;
}

/** Compact label badge for tags, modes, and counts. */
export function Badge(props: BadgeProps): JSX.Element;
