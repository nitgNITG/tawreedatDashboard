// components/OutlineInput.tsx
import { Input } from "@/components/ui/input";
import ErrorMsg from "../ErrorMsg";
import { Textarea } from "./textarea";
import clsx from "clsx";
import { SelectHTMLAttributes, forwardRef } from "react";

interface OutlineInputProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement | HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  iconStart?: React.ReactNode;
  iconEnd?: { child: React.ReactNode; label?: boolean };
  rows?: number; // Allow passing rows for textarea
}

// Use forwardRef for all field components for RHF compatibility
const OutlineField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  OutlineInputProps & { inputComponent: React.ElementType }
>(function OutlineField(
  {
    label,
    id,
    error,
    className,
    iconStart,
    iconEnd,
    placeholder = "",
    inputComponent: InputComponent,
    ...rest
  },
  ref
) {
  return (
    <div className="relative w-full">
      {iconStart && (
        <label
          htmlFor={id}
          className="absolute start-3 top-1/2 transform -translate-y-1/2"
        >
          {iconStart}
        </label>
      )}
      <InputComponent
        id={id}
        placeholder={placeholder}
        className={clsx(
          "peer h-12 pt-1 placeholder-transparent",
          iconStart && "ps-7",
          iconEnd && "pe-7",
          "w-full appearance-none",
          "text-sm bg-white text-muted-foreground transition-all",
          className
        )}
        ref={ref}
        {...rest}
      />
      <label
        htmlFor={id}
        className="absolute start-3 -top-2.5 text-xs bg-white text-muted-foreground px-1 transition-all
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                   peer-placeholder-shown:text-muted-foreground peer-focus:-top-2.5
                   peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </label>
      {iconEnd?.label && (
        <label
          htmlFor={id}
          className="absolute end-3 top-1/2 transform -translate-y-1/2"
        >
          {iconEnd.child}
        </label>
      )}
      {!iconEnd?.label && iconEnd?.child}
      {error && <ErrorMsg message={error} />}
    </div>
  );
});

export const OutlineInput = forwardRef<HTMLInputElement, OutlineInputProps>(
  function OutlineInput(props, ref) {
    return <OutlineField {...props} inputComponent={Input} ref={ref} />;
  }
);

export const OutlineTextArea = forwardRef<
  HTMLTextAreaElement,
  OutlineInputProps
>(function OutlineTextArea(props, ref) {
  return <OutlineField {...props} inputComponent={Textarea} ref={ref} />;
});


export const OutlineSelect = forwardRef<
  HTMLSelectElement,
  OutlineInputProps &
    SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }
>(function OutlineSelect(
  {
    label,
    id,
    error,
    className,
    iconStart,
    iconEnd,
    placeholder = "",
    children,
    ...rest
  },
  ref
) {
  return (
    <div className="relative w-full">
      {iconStart && (
        <label
          htmlFor={id}
          className="absolute start-3 top-1/2 transform -translate-y-1/2"
        >
          {iconStart}
        </label>
      )}
      <select
        id={id}
        className={clsx(
          "peer h-12 pt-1 placeholder-transparent",
          iconStart && "ps-7",
          iconEnd && "pe-7",
          "w-full appearance-none",
          "text-sm bg-white text-muted-foreground transition-all",
          className
        )}
        ref={ref}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <label
        htmlFor={id}
        className="absolute start-3 -top-2.5 text-xs bg-white text-muted-foreground px-1 transition-all
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                   peer-placeholder-shown:text-muted-foreground peer-focus:-top-2.5
                   peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </label>
      {iconEnd?.label && (
        <label
          htmlFor={id}
          className="absolute end-3 top-1/2 transform -translate-y-1/2"
        >
          {iconEnd.child}
        </label>
      )}
      {!iconEnd?.label && iconEnd?.child}
      {error && <ErrorMsg message={error} />}
    </div>
  );
});
