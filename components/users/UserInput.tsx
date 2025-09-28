import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";
import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
  Path,
} from "react-hook-form";
import ErrorMsg from "../ErrorMsg";

interface UserInputProps<TFieldValues extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: string | number;
  fieldForm: Path<TFieldValues>;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  roles: RegisterOptions<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  labelIcon?: React.ReactNode;
  disabled?: boolean;
}

const UserInput = <TFieldValues extends FieldValues>({
  defaultValue,
  fieldForm,
  label,
  className,
  register,
  icon,
  roles,
  errors,
  labelIcon,
  disabled,
  ...rest
}: UserInputProps<TFieldValues>) => {
  const isFieldFormNested = fieldForm.includes(".");
  const fieldName = isFieldFormNested ? fieldForm.split(".")[0] : fieldForm;
  const finalFieldName = fieldForm.split(".")[1];
  return (
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
      <div className="relative flex">
        {labelIcon && (
          <label
            className="absolute inset-y-0 start-3 grid place-content-center"
            htmlFor={`${fieldForm}Id`}
          >
            {labelIcon}
          </label>
        )}
        <input
          id={`${fieldForm}Id`}
          defaultValue={defaultValue}
          {...register(fieldForm, roles)}
          autoComplete="off"
          disabled={disabled}
          className={clsx(
            "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent",
            "hover:border-primary focus:border-primary outline-none w-full",
            "transition-colors duration-200 ease-in-out shadow-[0px_0px_5px_-1px_#00000040]",
            icon && "pr-10", // Add padding if icon exists
            labelIcon && "ps-10", // Add padding if labelIcon exists
            disabled && "cursor-not-allowed opacity-50 bg-gray-100",
            className
          )}
          {...rest}
        />
        {icon && (
          <span className="absolute grid place-content-center inset-y-0 end-3">
            {icon}
          </span>
        )}
      </div>
      <div className="col-span-full min-h-min">
        {isFieldFormNested ? (
          <ErrorMsg
            message={
              typeof errors?.[fieldName] === "object" &&
              errors?.[fieldName] !== null &&
              finalFieldName &&
              typeof (errors as any)[fieldName]?.[finalFieldName]?.message ===
                "string"
                ? (errors as any)[fieldName][finalFieldName].message
                : undefined
            }
          />
        ) : (
          <ErrorMsg message={errors?.[fieldForm]?.message as string} />
        )}
      </div>
    </div>
  );
};

export default UserInput;
