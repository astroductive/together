import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Full name — initials are derived from it. */
  name?: string;
  /** Optional image URL. */
  src?: string | null;
  /** Diameter in px. @default 34 */
  size?: number;
  style?: React.CSSProperties;
}

/** Circular initials/photo avatar. */
export function Avatar(props: AvatarProps): JSX.Element;
