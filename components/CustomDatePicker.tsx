"use client";
import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import { useLocale } from "next-intl";
import { InputHTMLAttributes, useRef } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
} from "react-hook-form";
import ErrorMsg from "./ErrorMsg";

interface CustomDatePickerProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue"> {
  label: string;
  labelIcon?: React.ReactNode;
  fieldForm: Path<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  defaultValue?: string;
  rules?: Omit<
    RegisterOptions<TFieldValues, Path<TFieldValues>>,
    "disabled" | "setValueAs" | "valueAsNumber"
  >;
  className?: string;
  onClick?: () => void;
}

const CustomDatePicker = <TFieldValues extends FieldValues>({
  label,
  labelIcon,
  fieldForm,
  errors,
  control,
  defaultValue,
  rules,
  className,
  onClick,
  ...rest
}: CustomDatePickerProps<TFieldValues>) => {
  const local = useLocale();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleCalendarClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };
  return (
    <div
      className={clsx(
        "grid items-center max-md:grid-cols-1 w-full h-min",
        labelIcon && !label ? "grid-cols-1" : "grid-cols-[1fr_2.5fr]"
      )}
    >
      {label && (
        <label className="text-nowrap text-sm" htmlFor={String(fieldForm)}>
          {label}:
        </label>
      )}
      <Controller
        name={fieldForm}
        control={control}
        defaultValue={
          defaultValue as PathValue<TFieldValues, Path<TFieldValues>>
        }
        rules={rules}
        render={({ field }) => (
          <div className={clsx("relative", className)}>
            {labelIcon && (
              <label
                className="absolute inset-y-0 start-3 grid place-content-center z-10"
                htmlFor={String(fieldForm)}
              >
                {labelIcon}
              </label>
            )}
            <div className="relative">
              <input
                {...field}
                // ref={inputRef}
                ref={(e) => {
                  field.ref(e);
                  inputRef.current = e;
                }}
                id={String(fieldForm)}
                type="date"
                className={clsx(
                  "border-2 border-[#DADADA] p-2 pe-10 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
                  "hover:border-primary focus:border-primary w-full",
                  "transition-colors duration-200 ease-in-out hideCalendarIcon",
                  labelIcon && "ps-10",
                  local === "ar" && "date-input-rtl"
                )}
                onClick={onClick}
                {...rest}
              />
              <button
                type="button"
                className={clsx(
                  "absolute grid place-content-center inset-y-0 end-2"
                )}
                onClick={handleCalendarClick}
                aria-label={`Open ${String(fieldForm)} picker`}
              >
                <CalendarDays className="text-primary size-5" />
              </button>
            </div>
          </div>
        )}
      />

      <div className="col-span-full">
        <ErrorMsg message={errors?.[fieldForm]?.message as string} />
      </div>
    </div>
  );
};

export default CustomDatePicker;
