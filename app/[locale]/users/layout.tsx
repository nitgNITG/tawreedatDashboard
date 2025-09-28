import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Users",
  description: "This is a page for user",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default Layout;
