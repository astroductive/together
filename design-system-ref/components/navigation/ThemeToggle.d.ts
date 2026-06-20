import React from "react";

export interface ThemeToggleProps {
  /** @default "dark" */
  value?: "light" | "dark";
  onChange?: (value: "light" | "dark") => void;
  style?: React.CSSProperties;
}

/** Pill-style light/dark theme toggle. */
export function ThemeToggle(props: ThemeToggleProps): JSX.Element;
