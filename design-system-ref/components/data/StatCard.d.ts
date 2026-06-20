import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  /** Percent change; green if >= 0, red otherwise. */
  delta?: number | null;
  style?: React.CSSProperties;
}

/**
 * KPI / metric card.
 * @startingPoint section="Data" subtitle="KPI stat card" viewport="320x150"
 */
export function StatCard(props: StatCardProps): JSX.Element;
