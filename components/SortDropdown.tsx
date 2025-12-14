"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  ArrowUpDown,
  X,
} from "lucide-react";
import usePushQuery from "@/hooks/usePushQuery";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SortDropdown = ({
  //   className,
  archive,
  options,
}: {
  //   className?: string;
  archive?: boolean;
  options: { label: string; value: string }[];
}) => {
  const t = useTranslations("Tablecomponent");
  const pushQuery = usePushQuery();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get(archive ? "sortArchive" : "sort") ?? "";
  const currentOrder = currentSort.startsWith("-") ? "desc" : "asc";
  const currentSortField = currentSort.replace("-", "");

  const handleSort = (key: string) => {
    const sortParam = archive ? "sortArchive" : "sort";

    // Clear sort if key is empty
    if (!key) {
      pushQuery(sortParam, "");
      return;
    }

    if (currentSortField === key) {
      if (currentOrder === "asc") {
        pushQuery(sortParam, `-${key}`);
      } else {
        pushQuery(sortParam, "");
      }
    } else {
      pushQuery(sortParam, key);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md text-gray-700 font-medium hover:bg-primary/10 relative">
          {t("sort")}
          <ArrowDownWideNarrow className="size-4" />
          {currentSortField && (
            <span className="absolute -top-2 -end-2 bg-primary text-white text-xs rounded-full size-5 flex-center">
              1
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentSortField && (
          <DropdownMenuItem
            onClick={() => handleSort("")}
            className="font-bold"
          >
            <X className="size-4 me-2" />
            {t("clearSort")}
          </DropdownMenuItem>
        )}
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSort(option.value)}
            className={
              currentSortField === option.value ? "bg-primary/10 font-bold" : ""
            }
          >
            {option.label}
            {currentSortField === option.value &&
              (currentOrder === "asc" ? (
                <ArrowUp className="size-3.5 text-primary font-bold transition" />
              ) : (
                <ArrowDown className="size-3.5 text-primary font-bold transition" />
              ))}
            {currentSortField !== option.value && (
              <ArrowUpDown className="size-3.5 text-gray-400 transition" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
