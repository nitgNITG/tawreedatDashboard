"use client";
import { ReactNode } from "react";

interface SectionWrapperProps {
  title: string;
  children: ReactNode;
}

export function SectionWrapper({ title, children }: SectionWrapperProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}
