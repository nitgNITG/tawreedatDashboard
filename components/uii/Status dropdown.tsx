"use client";
import React, { useState } from "react";

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex gap-5 justify-between">
      <label className="my-auto text-sm tracking-wide text-center text-black">
        Status :
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex overflow-hidden gap-10 px-6 py-1 text-xs text-black bg-white rounded-xl border border-solid shadow-sm border-zinc-300 max-md:pl-5"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/c6eff137ff7f402eb24270a4bf4049e8/3ef534ea926c113b86e7801547ee8fab0397db1ea487c9a69b1f31c05223c4c4"
          className="object-contain shrink-0 my-auto aspect-[1.45] w-[13px]"
          alt="Dropdown arrow"
        />
      </button>
    </div>
  );
};
