import React from "react";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Toggle switch (teal when on). */
export function Switch(props: SwitchProps): JSX.Element;
