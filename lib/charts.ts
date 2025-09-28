import { ChartType, DateTypeOption, DateType } from "@/types/charts";

export const colors = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#F44336", // Red
  "#00BCD4", // Cyan
  "#FFEB3B", // Yellow
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
];

export const chartTypes: ChartType[] = ["date", "bar", "pie"];

export const getDateTypeOptions = (
  t: (key: string) => string
): DateTypeOption[] => [
  { value: "daily", label: t("daily") },
  { value: "weekly", label: t("weekly") },
  { value: "monthly", label: t("monthly") },
  { value: "yearly", label: t("yearly") },
];
