import React from "react";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Segmented control for mode / language switching. */
export function Segmented(props: SegmentedProps): JSX.Element;
