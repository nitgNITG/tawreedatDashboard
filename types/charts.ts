export type ChartType = "date" | "bar" | "pie";
export type DateType = "daily" | "weekly" | "monthly" | "yearly";
export type DateTypeOption = { value: DateType; label: string };
export interface FetchChartParams {
  from?: Date;
  to?: Date;
  byDates?: boolean;
  dateType?: DateType;
  brandIds?: number[];
}
