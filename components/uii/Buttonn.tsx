"use client";
import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "red" | "red2";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  onClick,
  type = "button",
  className = "",
}) => {
  const baseStyles = `
    flex
    flex-row
    justify-center
    items-center
    py-[5px]
    gap-2
    w-[152px]
    h-[28px]
    text-sm
    font-cairo
    font-bold
    leading-[26px]
    text-center
    shadow-[0px_2px_6px_-1px_rgba(0,0,0,0.15)]
    rounded-[15px]
    transition-all
    duration-200
  `;

  const variantStyles = {
    primary: "bg-[#2AB09C] text-white hover:bg-[#239485]",
    secondary: "bg-white border border-solid border-slate-950 text-black hover:bg-gray-50",
    red: "bg-red-500 text-white hover:bg-red-600",
    red2: "bg-white border border-solid border-slate-950 text-red-500 hover:bg-[#E92929] hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
        max-md:px-5
      `}
    >
      {children}
    </button>
  );
};
