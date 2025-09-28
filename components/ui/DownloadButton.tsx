import useClickOutside from "@/hooks/useClickOutSide";
import { useAppContext } from "@/context/appContext";
import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { useState } from "react";
import { LoadingIcon } from "../icons";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface DownloadButtonProps<T> {
  model: string;
  fields: Array<keyof T>;
  filters?: Partial<Record<keyof T, any>>;
  sortCreatedAt?: boolean;
  items?: Array<keyof T>;
  apiUrl?: string;
  archive?: boolean;
  disableKeyword?: boolean;
}

const DownloadButton = <T,>({
  model,
  archive,
  fields,
  filters = {},
  sortCreatedAt = true,
  apiUrl = "/api/download",
  items,
  disableKeyword = false,
}: DownloadButtonProps<T>) => {
  const t = useTranslations("pagination");
  const searchParams = useSearchParams();
  const lang = useLocale();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "CSV">("PDF");
  const [isLoading, setIsLoading] = useState(false);
  const dateFrom =
    searchParams.get(archive ? "createdAt[gte]Archive" : "createdAt[gte]") ??
    null;
  const dateTo =
    searchParams.get(archive ? "createdAt[lte]Archive" : "createdAt[lte]") ??
    null;
  const sort = searchParams.get(archive ? "sortArchive" : "sort") ?? null;
  const keyword = disableKeyword
    ? null
    : searchParams.get(archive ? "keywordArchive" : "keyword") ?? null;

  const exportMenuRef = useClickOutside(
    () => setIsExportOpen(false),
    isExportOpen
  );
  const { token } = useAppContext();

  const handleDownload = async (format: "pdf" | "csv") => {
    try {
      setIsLoading(true);
      setSelectedFormat(format.toUpperCase() as "PDF" | "CSV");
      setIsExportOpen(false);

      const queryParams = new URLSearchParams({
        fields: fields.join(","),
        lang,
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      if (items) {
        queryParams.append("items", items.join(","));
      }

      if (sort) {
        queryParams.append("sort", sort);
      }

      if (!sort && sortCreatedAt) {
        queryParams.append("sort", "-createdAt");
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        queryParams.append("createdAt[gte]", fromDate.toISOString());
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        queryParams.append("createdAt[lte]", toDate.toISOString());
      }

      if (keyword) {
        queryParams.append("keyword", keyword);
      }

      const response = await axios.post(
        `${apiUrl}?${queryParams}`,
        {
          fileType: format.toLowerCase(),
          model,
        },
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        const blob = new Blob([response.data], {
          type: format === "csv" ? "text/csv" : "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1].replace(/"/g, "")
          : `${model}-${Date.now()}.${format}`;

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(t("downloadSuccess"));
      }
    } catch (error: any) {
      console.error("Download error:", error);

      let errorMessage = t("downloadError");

      // Handle error response when responseType is blob
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage =
            errorData.message ?? errorData.error ?? t("downloadError");
        } catch (parseError) {
          // If we can't parse the blob, use the default error message
          console.error("Failed to parse error blob:", parseError);
          errorMessage = t("downloadError");
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="text-nowrap">{t("downloads")}</span>
      <div ref={exportMenuRef} className="relative">
        <button
          onClick={() => setIsExportOpen(!isExportOpen)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1 rounded border border-secondary text-secondary hover:bg-secondary/10 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <LoadingIcon className="size-5 animate-spin" />
          ) : (
            <Download className="size-5" />
          )}
          {selectedFormat}
        </button>

        {isExportOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border z-50">
            {["PDF", "CSV"].map((format) => (
              <button
                key={format}
                onClick={() =>
                  handleDownload(format.toLowerCase() as "pdf" | "csv")
                }
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {format}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadButton;
