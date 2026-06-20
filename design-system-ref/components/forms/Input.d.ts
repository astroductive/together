import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Labeled text field with teal focus ring and error state. */
export function Input(props: InputProps): JSX.Element;
