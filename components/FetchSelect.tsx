import React, { useCallback, useEffect, useState, useRef } from "react";
import { ChevronDown, Loader, X } from "lucide-react";
import {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { useLocale } from "next-intl";
import ErrorMsg from "./ErrorMsg";
import clsx from "clsx";

type FetchResponse<T> = {
  data: T[];
  totalPages: number;
};

type FetchFunction<T> = (params: {
  search: string;
  skip: number;
  limit: number;
}) => Promise<FetchResponse<T>>;

interface FetchSelectProps<T, TFieldValues extends FieldValues = FieldValues> {
  fieldForm?: Path<TFieldValues>;
  label: string;
  fetchFunction: FetchFunction<T>;
  getOptionLabel: (item: T) => string | React.ReactNode;
  getOptionValue: (item: T) => string | number;
  getOptionDisplayText?: (item: T) => string; // For input display when option contains React nodes
  defaultValues?: T[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  roles?: RegisterOptions<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  register?: UseFormRegister<TFieldValues>;
  setValue?: UseFormSetValue<TFieldValues>;
  disabled?: boolean;
  clearable?: boolean;
  limit?: number;
  debounceMs?: number;
  onChange?: (selectedOptions: T[]) => void;
  multiple?: boolean;
}

export function FetchSelect<T, TFieldValues extends FieldValues = FieldValues>({
  fieldForm,
  label,
  fetchFunction,
  getOptionLabel,
  getOptionValue,
  getOptionDisplayText,
  defaultValues = [],
  placeholder = "Search...",
  className = "",
  icon,
  roles,
  errors,
  register,
  setValue,
  disabled = false,
  clearable = true,
  limit = 10,
  debounceMs = 300,
  onChange,
  multiple = false,
}: Readonly<FetchSelectProps<T, TFieldValues>>) {
  const [options, setOptions] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<T[]>(defaultValues);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [fetchedPages, setFetchedPages] = useState<Set<string>>(new Set());
  const [allDataFetched, setAllDataFetched] = useState(false);
  const local = useLocale();

  // Helper function to get string representation for input display
  const getDisplayText = (item: T): string => {
    if (getOptionDisplayText) {
      return getOptionDisplayText(item);
    }
    const label = getOptionLabel(item);
    return typeof label === "string" ? label : String(getOptionValue(item));
  };

  const selectRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const getPageKey = (search: string, pageNum: number) =>
    `${search}-${pageNum}`;

  const fetchOptions = useCallback(async () => {
    const currentPageKey = getPageKey(searchTerm, page);
    if (allDataFetched || fetchedPages.has(currentPageKey)) return;

    setIsLoading(true);
    try {
      const response = await fetchFunction({
        search: searchTerm,
        skip: (page - 1) * limit,
        limit,
      });

      setOptions((prev) =>
        page === 1 ? response.data : [...prev, ...response.data]
      );
      setTotalPages(response.totalPages);
      setFetchedPages((prev) => new Set(prev).add(currentPageKey));

      if (page >= response.totalPages) {
        setAllDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, searchTerm, page, limit, fetchedPages, allDataFetched]);

  useEffect(() => {
    setAllDataFetched(false);
    setFetchedPages(new Set());
    setPage(1);
    setOptions([]);
  }, [searchTerm]);

  useEffect(() => {
    if (defaultValues.length) {
      setSelectedOptions(defaultValues);
      if (setValue && fieldForm) {
        setValue(
          fieldForm,
          (multiple
            ? defaultValues.map(getOptionValue).join(",")
            : getOptionValue(defaultValues[0])) as PathValue<
            TFieldValues,
            Path<TFieldValues>
          >
        );
      }
      if (onChange) onChange(defaultValues);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !allDataFetched) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(fetchOptions, debounceMs);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [fetchOptions, isOpen, searchTerm, debounceMs, allDataFetched]);

  useEffect(() => {
    const checkDropdownPosition = () => {
      if (selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setDropdownPosition(
          spaceBelow < 200 && spaceAbove > 200 ? "top" : "bottom"
        );
      }
    };

    if (isOpen) {
      checkDropdownPosition();
      window.addEventListener("resize", checkDropdownPosition);
      return () => window.removeEventListener("resize", checkDropdownPosition);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const filteredOptions = options.filter(
        (option) =>
          !selectedOptions.some(
            (selected) => getOptionValue(selected) === getOptionValue(option)
          )
      );

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.focus();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, options, selectedOptions, highlightedIndex]);

  useEffect(() => {
    if (!isOpen || highlightedIndex === -1) return;

    const dropdown = selectRef.current?.querySelector(
      "ul"
    ) as HTMLUListElement | null;
    const highlightedItem = dropdown?.querySelector(
      ".highlighted"
    ) as HTMLElement | null;

    if (highlightedItem && dropdown) {
      const { offsetTop, offsetHeight } = highlightedItem;
      const { scrollTop, clientHeight } = dropdown;

      if (offsetTop < scrollTop) {
        dropdown.scrollTop = offsetTop;
      } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
        dropdown.scrollTop = offsetTop + offsetHeight - clientHeight;
      }
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: T) => {
    let newSelectedOptions: T[];

    if (multiple) {
      const isSelected = selectedOptions.some(
        (selected) => getOptionValue(selected) === getOptionValue(option)
      );
      newSelectedOptions = isSelected
        ? selectedOptions.filter(
            (selected) => getOptionValue(selected) !== getOptionValue(option)
          )
        : [...selectedOptions, option];
    } else {
      newSelectedOptions = [option];
      setIsOpen(false);
    }

    setSelectedOptions(newSelectedOptions);
    if (setValue && fieldForm) {
      setValue(
        fieldForm,
        (multiple
          ? newSelectedOptions.map(getOptionValue).join(",")
          : getOptionValue(newSelectedOptions[0])) as PathValue<
          TFieldValues,
          Path<TFieldValues>
        >
      );
    }
    setSearchTerm("");
    if (onChange) onChange(newSelectedOptions);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOptions([]);
    setSearchTerm("");
    if (setValue && fieldForm) {
      setValue(fieldForm, "" as PathValue<TFieldValues, Path<TFieldValues>>);
    }
    if (onChange) onChange([]);
  };

  const handleRemoveOption = (option: T) => {
    const newSelectedOptions = selectedOptions.filter(
      (selected) => getOptionValue(selected) !== getOptionValue(option)
    );
    setSelectedOptions(newSelectedOptions);
    if (setValue && fieldForm) {
      setValue(
        fieldForm,
        (multiple
          ? newSelectedOptions.map(getOptionValue).join(",")
          : newSelectedOptions[0]
          ? getOptionValue(newSelectedOptions[0])
          : "") as PathValue<TFieldValues, Path<TFieldValues>>
      );
    }
    if (onChange) onChange(newSelectedOptions);
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      !isLoading &&
      !allDataFetched &&
      page < totalPages
    ) {
      setPage((prev) => prev + 1);
    }
  };

  let inputProps = {};
  if (register && fieldForm) {
    const { ref: registerRef, ...registerRest } = register(fieldForm, roles);
    inputProps = { ...registerRest, ref: registerRef, id: `${fieldForm}Id` };
  }

  return (
    <div className="grid items-center grid-cols-[1fr_2.5fr] w-full h-min relative">
      <label
        className="text-nowrap text-sm"
        htmlFor={fieldForm ? `${fieldForm}Id` : label}
      >
        {label}:
      </label>
      <div
        className={clsx(
          "relative",
          className.includes("w-full") && "col-span-2 mt-2"
        )}
        ref={selectRef}
      >
        <input type="hidden" {...inputProps} />
        <div
          className={clsx(
            "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
            "hover:border-primary focus-within:border-primary transition-colors duration-200 ease-in-out",
            disabled && "bg-gray-100 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          {multiple ? (
            <div className="flex flex-wrap gap-1 w-full">
              {selectedOptions.map((option) => (
                <div
                  key={getOptionValue(option)}
                  className="bg-primary/10 text-primary rounded px-2 py-1 flex items-center gap-1"
                >
                  {getDisplayText(option)}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOption(option);
                    }}
                  />
                </div>
              ))}
              <input
                ref={inputRef}
                type="text"
                className="flex-grow bg-transparent outline-none min-w-[50px]"
                placeholder={selectedOptions.length === 0 ? placeholder : ""}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                disabled={disabled}
                readOnly={!isOpen}
              />
            </div>
          ) : (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent outline-none"
              placeholder={placeholder}
              value={
                selectedOptions.length > 0
                  ? getDisplayText(selectedOptions[0])
                  : searchTerm
              }
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              disabled={disabled}
              readOnly={!isOpen}
            />
          )}
          <div
            className={clsx(
              "absolute grid place-content-center inset-y-0",
              local === "en" ? "right-2" : "left-2"
            )}
          >
            {icon || (
              <>
                {clearable && selectedOptions.length > 0 && !disabled && (
                  <X
                    className="size-4 text-gray-400 hover:text-gray-600 mr-1"
                    onClick={handleClear}
                  />
                )}
                <ChevronDown
                  className={clsx(
                    "size-4 text-gray-400",
                    isOpen && "transform rotate-180 transition-transform"
                  )}
                />
              </>
            )}
          </div>
        </div>

        {isOpen && (
          <ul
            className={clsx(
              "absolute z-[1000] w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto",
              dropdownPosition === "bottom"
                ? "mt-1 top-full"
                : "mb-1 bottom-full"
            )}
            onScroll={handleScroll}
          >
            {options
              .filter(
                (option) =>
                  !multiple ||
                  !selectedOptions.some(
                    (selected) =>
                      getOptionValue(selected) === getOptionValue(option)
                  )
              )
              .map((option, index) => (
                <li
                  key={getOptionValue(option)}
                  className={clsx(
                    "px-3 py-2 cursor-pointer hover:bg-gray-100",
                    selectedOptions.some(
                      (selected) =>
                        getOptionValue(selected) === getOptionValue(option)
                    ) && "bg-primary text-white",
                    index === highlightedIndex && "bg-gray-200 highlighted"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </li>
              ))}
            {isLoading && (
              <li className="px-3 py-2 text-center text-gray-500">
                <Loader className="size-4 animate-spin inline mr-2" />
                Loading...
              </li>
            )}
            {!isLoading && options.length === 0 && (
              <li className="px-3 py-2 text-center text-gray-500">
                No options found
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="col-span-full">
        <ErrorMsg
          message={
            errors && fieldForm
              ? (errors?.[fieldForm]?.message as string) || ""
              : ""
          }
        />
      </div>
    </div>
  );
}

export default FetchSelect;
