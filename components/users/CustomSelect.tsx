import React, { SelectHTMLAttributes } from "react";
import clsx from "clsx";
import {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import ErrorMsg from "../ErrorMsg";
interface CustomSelectProps<TFieldValues extends FieldValues>
  extends SelectHTMLAttributes<HTMLSelectElement> {
  defaultValue?: string | number;
  fieldForm: Path<TFieldValues>;
  label: string;
  labelIcon?: React.ReactNode;
  options: Array<{
    value: string | number;
    label: string | number | React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
  errors: FieldErrors<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  roles: RegisterOptions<TFieldValues>;
  placeholder?: string;
}

const CustomSelect = <TFieldValues extends FieldValues>({
  label,
  defaultValue,
  fieldForm,
  options,
  className,
  errors,
  roles,
  register,
  placeholder = "",
  labelIcon,
  ...rest
}: CustomSelectProps<TFieldValues>) => {
  const local = useLocale();

  const updatedOptions = [{ value: "", label: placeholder }, ...options];
  return (
    <>
      <div
        className={clsx(
          "grid items-center max-md:grid-cols-1 w-full h-min",
          labelIcon && !label ? "grid-cols-1" : "grid-cols-[1fr_2.5fr]"
        )}
      >
        {label && (
          <label className="text-nowrap text-sm" htmlFor={`${fieldForm}Id`}>
            {label}:
          </label>
        )}
        <div className="relative">
          {labelIcon && (
            <label
              className="absolute inset-y-0 start-3 grid place-content-center z-10"
              htmlFor={`${fieldForm}Id`}
            >
              {labelIcon}
            </label>
          )}
          <select
            id={`${fieldForm}Id`}
            defaultValue={defaultValue}
            {...register(fieldForm, roles)}
            className={clsx(
              "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none appearance-none w-full pr-8",
              "hover:border-primary focus:border-primary",
              "transition-colors duration-200 ease-in-out",
              labelIcon && "ps-10",
              className
            )}
            {...rest}
          >
            {updatedOptions.map((option) => (
              <option
                // selected={defaultValue === option.value}
                key={option.value}
                value={option.value}
                disabled={option.disabled ?? false}
                className={clsx(
                  option.disabled &&
                    "text-gray-400 bg-gray-100 cursor-not-allowed",
                  !option.disabled && "text-black bg-white cursor-pointer"
                )}
              >
                {option.label}
              </option>
            ))}
          </select>
          <span
            className={clsx(
              "absolute inset-y-0 grid place-content-center pointer-events-none",
              local === "en" ? "right-2" : "left-2"
            )}
          >
            <ChevronDown className="text-primary size-5" />
          </span>
        </div>
      </div>
      <ErrorMsg message={errors?.[fieldForm]?.message as string} />
    </>
  );
};

export default CustomSelect;
