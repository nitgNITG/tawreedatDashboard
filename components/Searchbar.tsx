"use client";
import usePushQuery from "@/hooks/usePushQuery";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchIcon } from "./icons";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

export default function SearchBar() {
  const t = useTranslations("navbar");
  const searchParams = useSearchParams();
  const pushQuery = usePushQuery();
  const [search, setSearch] = useState(searchParams.get("keyword") ?? "");

  // Sync local state with URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const currentKeyword = searchParams.get("keyword") ?? "";
    setSearch(currentKeyword);
  }, [searchParams]);

  // Debounced search effect
  useEffect(() => {
    const currentKeyword = searchParams.get("keyword") ?? "";

    // Only proceed if the search value is different from current URL parameter
    if (search.trim() !== currentKeyword) {
      const timer = setTimeout(() => {
        if (search.trim()) {
          pushQuery("keyword", search.trim());
        } else if (currentKeyword) {
          // Only clear if there was a keyword before
          pushQuery("keyword", "");
        }
      }, 500); // 500ms debounce delay

      return () => clearTimeout(timer);
    }
  }, [search, searchParams, pushQuery]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Immediate search on form submit
    if (search.trim()) {
      pushQuery("keyword", search.trim());
    } else {
      pushQuery("keyword", "");
    }
  };

  const handleClear = () => {
    setSearch("");
    pushQuery("keyword", "");
  };
  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center relative border focus-within:outline p-2 w-80 rounded-lg bg-white shadow-[0px_0px_5px_-1px_#00000026]"
    >
      <input
        type="text"
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="size-full outline-none bg-transparent text-black pl-9 pr-8"
      />
      <button
        type="submit"
        className="text-black absolute left-0 bg-white h-full p-[10px] rounded-lg shadow-[0px_0px_5px_0px_#00000026]"
      >
        <SearchIcon className="size-4" />
      </button>
      {search && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
