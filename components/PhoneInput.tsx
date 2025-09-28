import React, { InputHTMLAttributes, useState, useEffect } from "react";
import clsx from "clsx";
import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
  Path,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import ErrorMsg from "./ErrorMsg";

// Country data with flag emojis and codes
const countries = [
  {
    code: "+20",
    iso: "EG",
  },
  {
    code: "+966",
    iso: "SA",
  },
];

interface PhoneInputProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue "> {
  defaultValue?: string;
  defaultCountryCode?: string;
  fieldForm: Path<TFieldValues>;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  roles: RegisterOptions<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  parentStyle?: string; // Optional prop to control width
}

const PhoneInput = <TFieldValues extends FieldValues>({
  defaultValue = "",
  defaultCountryCode = "+20",
  fieldForm,
  label,
  className,
  register,
  setValue,
  watch,
  icon,
  roles,
  errors,
  disabled = false,
  parentStyle = "w-full flex",
  ...rest
}: PhoneInputProps<TFieldValues>) => {
  // Parse existing phone number to extract country code and number
  const parsePhoneNumber = (phone: string) => {
    if (!phone) return { countryCode: defaultCountryCode, phoneNumber: "" };

    const country = countries.find((c) => phone.startsWith(c.code));
    if (country) {
      return {
        countryCode: country.code,
        phoneNumber: phone.substring(country.code.length),
      };
    }
    return { countryCode: defaultCountryCode, phoneNumber: phone };
  };

  const currentValue = watch?.(fieldForm) || defaultValue;
  const { countryCode: initialCountry, phoneNumber: initialPhone } =
    parsePhoneNumber(currentValue);

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone); // Update form value when country code or phone number changes
  const updateFormValue = (countryCode: string, phone: string) => {
    const fullPhoneNumber = phone ? `${countryCode}${phone}` : "";
    setValue(fieldForm, fullPhoneNumber as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  const handleCountryChange = (countryCode: string) => {
    if (disabled) return;
    setSelectedCountryCode(countryCode);
    updateFormValue(countryCode, phoneNumber);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const phone = e.target.value;
    setPhoneNumber(phone);
    updateFormValue(selectedCountryCode, phone);
  };

  // Sync with external value changes (but prevent infinite loops)
  useEffect(() => {
    const expectedValue = phoneNumber
      ? `${selectedCountryCode}${phoneNumber}`
      : "";
    if (currentValue !== expectedValue) {
      const { countryCode, phoneNumber: phone } =
        parsePhoneNumber(currentValue);
      setSelectedCountryCode(countryCode);
      setPhoneNumber(phone);
    }
  }, [currentValue]); // Remove selectedCountryCode and phoneNumber from dependencies

  return (
    <div className="grid items-center grid-cols-[1fr_2.5fr] max-md:grid-cols-1 w-full h-min">
      <label className="text-nowrap text-sm" htmlFor={`${fieldForm}Id`}>
        {label}:
      </label>
      <div className={clsx("relative", parentStyle)}>
        <div
          dir="ltr"
          className={clsx(
            "flex w-full border-2 border-[#DADADA] rounded-xl bg-transparent hover:border-primary focus-within:border-primary transition-colors duration-200 ease-in-out shadow-[0px_0px_5px_-1px_#00000040] overflow-hidden min-h-[44px]",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100"
          )}
        >
          <div className="w-1/4 border-r border-[#DADADA] bg-gray-50">
            <Select
              value={selectedCountryCode}
              onValueChange={handleCountryChange}
              // placeholder="Code"
              disabled={disabled}
            >
              <SelectTrigger className="border-0 rounded-none ring-0 py-0 px-1 focus:ring-0 shadow-none h-[44px] text-xs bg-transparent">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Phone Number Input */}
          <input
            dir="ltr"
            id={`${fieldForm}Id`}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            autoComplete="off"
            type="tel"
            disabled={disabled}
            className={clsx(
              "outline-none w-3/4 p-2 rounded-xl bg-transparent",
              icon && "pr-10",
              disabled && "cursor-not-allowed",
              className
            )}
            {...rest}
          />
        </div>
        {icon && (
          <span className="absolute grid place-content-center inset-y-0 end-2">
            {icon}
          </span>
        )}
      </div>
      <input
        type="hidden"
        {...register(fieldForm, roles)}
        disabled={disabled}
      />
      <div className="col-span-full">
        <ErrorMsg message={errors?.[fieldForm]?.message as string} />
      </div>
    </div>
  );
};

export default PhoneInput;
