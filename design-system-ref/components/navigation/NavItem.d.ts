import React from "react";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  /** Active row — gets the accent rail & tint. @default false */
  active?: boolean;
  /** Show an unread/notification dot. @default false */
  dot?: boolean;
  style?: React.CSSProperties;
}

/** Sidebar navigation row. */
export function NavItem(props: NavItemProps): JSX.Element;
