"use client";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import usePushQuery from "@/hooks/usePushQuery";
import useClickOutside from "@/hooks/useClickOutSide";
import DateRange from "../DateRange";

interface PaginationProps {
  count: number;
  bgColor?: boolean;
  totalPages: number;
  downloadButton?: React.ReactNode;
  showDateRange?: boolean;
  archive?: boolean;
  className?: string;
}

const Pagination = ({
  count,
  totalPages,
  bgColor,
  downloadButton,
  showDateRange = true,
  archive = false,
  className
}: PaginationProps) => {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const t = useTranslations("pagination");
  const searchParams = useSearchParams();
  const limit =
    Number(searchParams.get(archive ? "limitArchive" : "limit")) || 10;
  const skip = Number(searchParams.get(archive ? "skipArchive" : "skip")) || 0;
  const pushQuery = usePushQuery();

  const pageSizeRef = useClickOutside(
    () => setIsPageSizeOpen(false),
    isPageSizeOpen
  );

  const nextPage = () => {
    const nextSkip = skip + limit;
    if (nextSkip < count) {
      pushQuery(archive ? "skipArchive" : "skip", nextSkip.toString());
    }
  };

  const prevPage = () => {
    const prevSkip = Math.max(0, skip - limit);

    pushQuery(archive ? "skipArchive" : "skip", prevSkip.toString());
  };

  const handlePageSizeSelect = (size: number) => {
    pushQuery(archive ? "limitArchive" : "limit", size.toString());
    setIsPageSizeOpen(false);
  };

  return (
    <div
      className={clsx(
        "w-full px-4 py-3 flex flex-wrap gap-y-3 items-center justify-between rounded-b-3xl text-xs",
        "text-white bg-[#241234]",
        bgColor && "!text-[#02161e] bg-[#dfe2e8]",
        archive && "rounded-b-none",
        className 
      )}
    >
      {/* Download Button */}
      {downloadButton && (
        <div className="max-md:order-2 max-w-min">{downloadButton}</div>
      )}
      {showDateRange && <DateRange archive={archive} />}

      {/* Pagination Controls */}
      <div className="flex items-center gap-4 md:justify-end justify-between max-md:order-1">
        {/* Page size selector */}
        <div ref={pageSizeRef} className="relative">
          <button
            onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
            className="flex items-center space-x-1 px-3 py-1 rounded border border-secondary text-secondary hover:bg-secondary/10"
          >
            {limit === 0 ? "All" : limit}
            <ChevronDown className="w-4 h-4 text-secondary transform rotate-180" />
          </button>

          {isPageSizeOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => handlePageSizeSelect(size)}
                  className={clsx(
                    "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200",
                    " hover:text-primary",
                    limit === size && "bg-gray-100"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page info display */}
        <div className="text-sm font-semibold">
          {count > 0 ? (
            <span>
              {skip + 1}-{Math.min(skip + limit, count)} {t("of")} {count}
            </span>
          ) : (
            <span>0 {t("of")} 0</span>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 ">
          <button
            disabled={skip === 0}
            onClick={prevPage}
            className={`p-1 rounded transition-colors duration-200 ${
              skip === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-5 rtl:rotate-180 text-secondary" />
          </button>

          <button
            disabled={skip + limit >= count}
            onClick={nextPage}
            className={`p-1 rounded transition-colors duration-200 ${
              skip + limit >= count
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-white/10"
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="size-5 rtl:rotate-180 text-secondary" />
          </button>
        </div>

        {/* Current page display */}
        <div className="ml-2 text-sm text-inherit font-semibold">
          {skip / limit + 1} / {totalPages || 1}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
