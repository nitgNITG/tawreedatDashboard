"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import usePushQuery from "@/hooks/usePushQuery";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export interface FilterOption {
  label: string;
  value: string;
  queryParam: string; // The URL parameter name (e.g., 'status', 'category', 'isActive')
}

const FilterDropdown = ({
  options,
  placeholder = "filter",
}: {
  options: FilterOption[];
  placeholder?: string;
}) => {
  const t = useTranslations("Tablecomponent");
  const pushQuery = usePushQuery();
  const searchParams = useSearchParams();

  // Get current active filters
  const activeFilters = options.filter(
    (option) => searchParams.get(option.queryParam) === option.value
  );

  const handleFilter = (option: FilterOption) => {
  const currentValue = searchParams.get(option.queryParam);

  if (currentValue === option.value) {
    // Remove filter if already active
    pushQuery(option.queryParam, "");
  } else {
    pushQuery(option.queryParam, option.value);
  }
};

  const clearAllFilters = () => {
    pushQuery("clear", "");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md text-gray-700 font-medium hover:bg-primary/10 relative">
          {t(placeholder)}
          <Filter className="size-4" />
          {activeFilters.length > 0 && (
            <span className="absolute -top-2 -end-2 bg-primary text-white text-xs rounded-full size-5 flex-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {activeFilters.length > 0 && (
          <>
            <DropdownMenuItem
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="size-4 me-2" />
              {t("clearAllFilters")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {options.map((option) => {
          const isActive = searchParams.get(option.queryParam) === option.value;

          return (
            <DropdownMenuItem
              key={`${option.queryParam}-${option.value}`}
              onClick={() => handleFilter(option)}
              className={
                isActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "hover:bg-gray-50"
              }
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {isActive && <div className="size-2 bg-primary rounded-full" />}
              </div>
            </DropdownMenuItem>
          );
        })}

        {options.length === 0 && (
          <DropdownMenuItem disabled>
            {t("noFiltersAvailable")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
