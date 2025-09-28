"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { colors as Colors } from "@/lib/charts";

export interface ChartDataItem {
  id?: number;
  name: string;
  color?: string;
  users?: number;
  count?: number;
  totalAmount?: number;
  totalPoints?: number;
}

interface PieChartComponentProps {
  data: ChartDataItem[];
  colors?: string[];
  valueLabel?: "users" | "count" | "totalAmount" | "totalPoints";
  onItemClick?: (item: ChartDataItem) => void;
  height?: number | string;
  width?: number | string;
  showPercentage?: boolean;
}

const PieChartComponent = ({
  data,
  colors = Colors,
  valueLabel = "count",
  onItemClick,
  height = "100%",
  width = "100%",
  showPercentage = true,
}: PieChartComponentProps) => {
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>(
    data.reduce((acc, item) => ({ ...acc, [item.name]: true }), {})
  );

  // Prepare data with colors if not already provided and filter by visibility
  const chartData = data
    .filter((item) => visibleItems[item.name])
    .map((item) => ({
      ...item,
      value: item[valueLabel] ?? 0,
      color:
        item.color ??
        colors[data.findIndex((d) => d.name === item.name) % colors.length],
    }));

  const toggleItemVisibility = (itemName: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleClick = (data: any) => {
    if (onItemClick && data?.activePayload?.[0]) {
      onItemClick(data.activePayload[0].payload);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Item visibility toggles */}
      <div className="flex flex-wrap justify-center items-center gap-3 max-w-full py-2 mb-4">
        {data.map((item, index) => {
          const color = item.color ?? colors[index % colors.length];
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer"
              style={{
                backgroundColor: visibleItems[item.name]
                  ? `${color}20`
                  : "transparent",
                color: color,
                border: `1px solid ${color}`,
              }}
            >
              <Checkbox
                id={`pie-item-${item.name}`}
                checked={visibleItems[item.name]}
                onCheckedChange={() => toggleItemVisibility(item.name)}
              />
              <label
                htmlFor={`pie-item-${item.name}`}
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {item.name}
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex-1">
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={showPercentage}
              label={
                showPercentage
                  ? ({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                  : undefined
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              onClick={handleClick}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, valueLabel]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartComponent;
