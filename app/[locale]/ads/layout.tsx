import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ads",
  description: "This is a page for Ads",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default Layout;
