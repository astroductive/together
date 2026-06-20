import React from "react";

export interface LogoProps {
  /** Invert for dark backgrounds. @default false */
  light?: boolean;
  /** Icon mark only, no wordmark. @default false */
  mark?: boolean;
  /** Mark size in px (wordmark scales from it). @default 36 */
  size?: number;
  /** Show the "Sign language · One world" tagline. @default false */
  showTagline?: boolean;
  style?: React.CSSProperties;
}

/** Together brand lockup. */
export function Logo(props: LogoProps): JSX.Element;
