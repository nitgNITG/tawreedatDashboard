import React, { useState, useEffect, useRef } from "react";
import { Search, CalendarDays } from "lucide-react";
import { DateRange as TDateRange, DayPicker } from "react-day-picker";
import { ar, enGB } from "react-day-picker/locale";
import "react-day-picker/dist/style.css";
import useClickOutside from "@/hooks/useClickOutSide";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB");
};

interface DateRangeProps {
  value?: TDateRange;
  onChange?: (range: TDateRange | undefined) => void;
  onSearch?: (range: TDateRange | undefined) => void;
  archive?: boolean;
}

interface Position {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}

const DateRange = ({ value, onChange, onSearch, archive }: DateRangeProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<Position>({
    vertical: "bottom",
    horizontal: "left",
  });
  const pickerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("pagination");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Use external value if provided, otherwise use internal state
  const [internalDateRange, setInternalDateRange] = useState<
    TDateRange | undefined
  >(() => {
    if (value) return value;

    const fromDate = searchParams.get("createdAt[gte]");
    const toDate = searchParams.get("createdAt[lte]");
    if (fromDate || toDate) {
      return {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      };
    }
    return undefined;
  });

  // Sync internal state with external value when it changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalDateRange(value);
    }
  }, [value]);

  // Use the appropriate date range based on whether external value is provided
  const dateRange = value ?? internalDateRange;

  const calendarRef = useClickOutside(
    () => setIsCalendarOpen(false),
    isCalendarOpen
  );

  const handleDateRangeChange = (newRange: TDateRange | undefined) => {
    // If external onChange is provided, call it
    if (onChange) {
      onChange(newRange);
    } else {
      // Otherwise update internal state
      setInternalDateRange(newRange);
    }
  };

  const handleSearch = () => {
    // If external onSearch is provided, call it
    if (onSearch) {
      onSearch(dateRange);
      setIsCalendarOpen(false);
      return;
    }

    // Default search behavior
    const params = new URLSearchParams(searchParams.toString());
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      params.set(
        archive ? "createdAt[gte]Archive" : "createdAt[gte]",
        fromDate.toISOString()
      );
    } else {
      params.delete(archive ? "createdAt[gte]Archive" : "createdAt[gte]");
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      params.set(
        archive ? "createdAt[lte]Archive" : "createdAt[lte]",
        toDate.toISOString()
      );
    } else {
      params.delete(archive ? "createdAt[lte]Archive" : "createdAt[lte]");
    }
    params.set(archive ? "skipArchive" : "skip", "0");
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
    // Close the calendar
    setIsCalendarOpen(false);
  };

  useEffect(() => {
    if (isCalendarOpen && calendarRef.current && pickerRef.current) {
      const buttonRect = calendarRef.current.getBoundingClientRect();
      const pickerRect = pickerRef.current.getBoundingClientRect();
      const { innerHeight } = window;

      const spaceBelow = innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const needsScroll =
        pickerRect.height > spaceBelow && pickerRect.height > spaceAbove;

      setCalendarPosition({
        vertical:
          spaceBelow >= pickerRect.height || spaceBelow > spaceAbove
            ? "bottom"
            : "top",
        horizontal: "left",
        needsScroll,
      });
    }
  }, [isCalendarOpen]);

  // Update Position interface
  interface Position {
    vertical: "top" | "bottom";
    horizontal: "left" | "right";
    needsScroll?: boolean;
  }

  return (
    <div className="flex gap-4 max-md:order-3 max-w-min flex-col sm:flex-row items-start sm:items-center w-full md:w-auto">
      <div
        ref={calendarRef}
        className="flex items-center font-semibold gap-2 rounded-lg p-2 relative focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
      >
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          type="button"
          className="flex gap-3 items-center hover:outline hover:outline-1 hover:outline-current/20 rounded-md px-2 py-1 transition-all"
        >
          <span className="text-inherit">{t("from")}</span>
          <CalendarDays className="size-[0.9rem] text-secondary" />
          <input
            type="text"
            readOnly
            value={dateRange?.from ? formatDate(dateRange.from) : ""}
            className="w-[4.8rem] text-sm border-none text-inherit placeholder:text-inherit py-1 bg-transparent"
            placeholder="DD/MM/YYYY"
          />
          <span className="text-inherit">{t("to")}</span>
          <CalendarDays className="size-[0.9rem] text-secondary" />
          <input
            type="text"
            readOnly
            value={dateRange?.to ? formatDate(dateRange.to) : ""}
            className="w-[4.8rem] text-sm border-none text-inherit placeholder:text-inherit py-1 bg-transparent"
            placeholder="DD/MM/YYYY"
          />
        </button>
        {isCalendarOpen && (
          <div
            className={clsx(
              "absolute z-[1000] shadow-xl rounded-lg bg-white mt-2",
              calendarPosition.vertical === "bottom"
                ? "top-full"
                : "bottom-full",
              calendarPosition.horizontal === "left" ? "left-0" : "right-0",
              calendarPosition.needsScroll && "max-h-[250px] overflow-y-auto"
            )}
          >
            <div ref={pickerRef}>
              <DayPicker
                locale={locale === "ar" ? ar : enGB}
                dir={locale === "ar" ? "rtl" : "ltr"}
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                className={clsx(
                  "text-black w-full bg-white shadow-lg rounded-lg border p-2",
                  calendarPosition.needsScroll && "h-full"
                )}
                footer={
                  <div className="p-2 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        handleDateRangeChange(undefined);
                        setIsCalendarOpen(false);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:opacity-90"
                    >
                      {t("apply")}
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          className="p-2 text-secondary rounded-lg hover:opacity-80 transition-opacity"
        >
          <Search className="size-3 xl:size-5" />
        </button>
      </div>
    </div>
  );
};

export default DateRange;
