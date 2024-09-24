import { Dashboard } from "@/components/dashboard";
import React from "react";

export const Component = function Start(props: DashboardProps): JSX.Element {
  const { className, ...other } = props;

  return <Dashboard />;
};

export type DashboardProps = React.HTMLAttributes<HTMLDivElement>;
