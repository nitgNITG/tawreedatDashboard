"use client";
import { EyeIcon } from "@/components/icons";
import Pagination from "@/components/ui/Pagination";
import Table, { TableHeader } from "@/components/ui/Table";
import { DateToText } from "@/lib/DateToText";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import OrderDetails from "./OrderDetails";
import { Order } from "@/app/[locale]/orders/OrdersData";
import { orderSums } from "@/app/[locale]/users/[id]/UserOrdersData";

const UserOrders = ({
  orders,
  totalCount,
  totalPages,
  sumOrders,
}: {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  sumOrders: orderSums;
}) => {
  const t = useTranslations("user");
  const locale = useLocale() as "en" | "ar";
  const [openOrderDetails, setOpenOrderDetails] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[] | []>([]);

  const headers: TableHeader[] = [
    { name: "date", sortable: true, key: "createdAt" },
    { name: "order", sortable: true, key: "orderNumber" },
    { name: "cost", sortable: true, key: "totalAmount" },
    { name: "address", sortable: true, key: "shippingAddress" },
    { name: "delivered", sortable: true, key: "updatedAt" },
    { name: "action", className: "flex justify-center items-center" },
  ];

  useEffect(() => {
    setUserOrders(orders);
  }, []);

  return (
    <div id="orders">
      {orderDetails && (
        <OrderDetails
          order={orderDetails}
          open={openOrderDetails}
          setOpen={() => {
            setOpenOrderDetails(false);
            setOrderDetails(null);
          }}
        />
      )}
      <Table
        headers={headers}
        bgColor
        pagination={
          <Pagination bgColor count={totalCount} totalPages={totalPages} />
        }
      >
        {!userOrders.length && (
          <tr className="odd:bg-white even:bg-[#F6EEFA] border-b">
            <td
              colSpan={headers.length}
              scope="row"
              className="px-6 py-4 text-center font-bold"
            >
              {t("no data yet")}
            </td>
          </tr>
        )}
        {userOrders?.map((order) => (
          <tr
            key={order.id}
            className={"odd:bg-white even:bg-[#F6EEFA] border-b"}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              {DateToText(order.createdAt, locale)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap">{order.totalAmount}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {order.shippingAddress as string}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {order.status === "DELIVERED" && order.updatedAt
                ? DateToText(order.updatedAt, locale)
                : "-"}
            </td>
            <td className="px-6 py-4 flex justify-center">
              <button
                onClick={() => {
                  setOrderDetails(order);
                  setOpenOrderDetails(true);
                }}
                type="button"
                className="text-primary hover:text-gray-700 transition-colors"
              >
                <EyeIcon className="size-5" />
              </button>
            </td>
          </tr>
        ))}
        <tr className="bg-[#F6EEFA] sticky bottom-0">
          <td className="px-6 py-4 whitespace-nowrap font-bold">
            {t("total")}
          </td>
          <td className="px-6 py-4 whitespace-nowrap font-bold">
            {totalCount} {t("orders")}
          </td>
          {Object.entries(sumOrders).map(([key, value], idx, arr) => {
            if (idx === arr.length - 1) {
              // Last sum takes the rest of the columns
              return (
                <td
                  key={key}
                  className="px-6 py-4 whitespace-nowrap font-bold"
                  colSpan={headers.length - arr.length}
                >
                  {t(key)} {t("totalPrice", { price: value })}
                </td>
              );
            }
            return (
              <td key={key} className="px-6 py-4 whitespace-nowrap font-bold">
                {t(key)} {t("totalPrice", { price: value })}
              </td>
            );
          })}
        </tr>
      </Table>
    </div>
  );
};

export default UserOrders;
