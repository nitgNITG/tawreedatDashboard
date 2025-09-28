"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { colors as Colors } from "@/lib/charts";

interface TimeSeriesItem {
  id?: number;
  name: string;
  color?: string;
  users?: number;
  count?: number;
  totalAmount?: number;
  totalPoints?: number;
}

type DynamicKey = "badges" | "roles" | "brands" | "types";

type TimeSeriesDataPoint = {
  period: string;
} & Partial<Record<DynamicKey, TimeSeriesItem[]>>;

interface DateChartProps {
  data: TimeSeriesDataPoint[];
  height?: number | string;
  width?: number | string;
  onItemClick?: (item: { name?: string }) => void;
  colors?: string[];
  itemKey: DynamicKey;
  valueLabel?: "users" | "count" | "totalAmount" | "totalPoints";
}

const DateChart = ({
  data,
  height = "100%",
  width = "100%",
  onItemClick,
  colors = Colors,
  itemKey,
  valueLabel = "users",
}: DateChartProps) => {
  // Determine which items array to use (badges or roles)
  const getItems = (point: TimeSeriesDataPoint) => {
    return point[itemKey] || [];
  };

  // Extract all unique item names from the data
  const allItemNames = Array.from(
    new Set(data.flatMap((point) => getItems(point).map((item) => item.name)))
  );

  // State to track which items are visible
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>(
    allItemNames.reduce((acc, name) => ({ ...acc, [name]: true }), {})
  );

  // Format data for the chart
  const formattedData = data.map((point) => {
    const result: Record<string, any> = {
      period: point.period,
    };

    // Add users for each item
    getItems(point).forEach((item) => {
      result[item.name] = item[valueLabel];
      // Store color information if available
      if (item.color) {
        result[`${item.name}_color`] = item.color;
      }
    });

    return result;
  });

  // Toggle item visibility
  const toggleItemVisibility = (itemName: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Get colors for each item
  const itemColors = allItemNames.reduce<Record<string, string>>(
    (acc, name, index) => {
      // Try to find the color in the data first
      for (const point of data) {
        const item = getItems(point).find((i) => i.name === name);
        if (item && item.color) {
          acc[name] = item.color;
          return acc;
        }
      }
      // If no color is found, use the colors array
      acc[name] = colors[index % colors.length];
      return acc;
    },
    {}
  ); // Handle individual bar click
  const handleBarClick = (data: any, itemName: string) => {
    console.log(`Bar clicked: ${itemName}`);

    if (onItemClick) {
      onItemClick({ name: itemName });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Item visibility toggles */}
      <div className="flex flex-wrap justify-center items-center gap-3 max-w-full py-2 mb-4">
        {allItemNames.map((itemName) => {
          const color = itemColors[itemName];
          return (
            <div
              key={itemName}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer"
              style={{
                backgroundColor: visibleItems[itemName]
                  ? `${color}20`
                  : "transparent",
                color: color,
                border: `1px solid ${color}`,
              }}
            >
              <Checkbox
                id={`date-item-${itemName}`}
                checked={visibleItems[itemName]}
                onCheckedChange={() => toggleItemVisibility(itemName)}
              />
              <label
                htmlFor={`date-item-${itemName}`}
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {itemName}
              </label>
            </div>
          );
        })}
      </div>{" "}
      <div className="flex-1">
        <ResponsiveContainer width={width} height={height}>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            {allItemNames.map(
              (itemName) =>
                visibleItems[itemName] && (
                  <Bar
                    key={itemName}
                    dataKey={itemName}
                    name={itemName}
                    fill={itemColors[itemName]}
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => handleBarClick(data, itemName)}
                    style={{ cursor: onItemClick ? "pointer" : "default" }}
                  />
                )
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DateChart;
