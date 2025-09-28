import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Orders",
  description: "This is a page for orders",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default Layout;
