"use client";
import React from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
}) => {
  return (
    <div className="flex gap-5 justify-between text-sm tracking-wide text-center text-black">
      <label className="my-auto">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex shrink-0 bg-white rounded-xl border border-solid shadow-sm border-zinc-300 h-[30px] w-[197px] px-3"
        aria-label={label}
      />
    </div>
  );
};
