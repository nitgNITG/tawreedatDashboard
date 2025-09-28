"use client";
import React from "react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex">
      <label className="grow my-auto tracking-wide text-center text-black">
        {label}
      </label>
      <div className="flex overflow-hidden gap-2 px-2.5 py-1 font-medium text-black bg-white rounded-xl border border-solid shadow-sm border-zinc-300">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="grow outline-none"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/c6eff137ff7f402eb24270a4bf4049e8/eeae432699773e709791d71fd686afba45b9f234f2eef242ea1e3525fbb3642d"
          className="object-contain shrink-0 my-auto aspect-[0.92] w-[11px]"
          alt="Calendar icon"
        />
      </div>
    </div>
  );
};
