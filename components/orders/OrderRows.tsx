"use client";
import { useLocale, useTranslations } from "next-intl";
import { DateToText } from "@/lib/DateToText";
import { Link } from "@/i18n/routing";
import Table, { TableHeader } from "@/components/ui/Table";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import ImageApi from "../ImageApi";
import OrderDetails from "../users/id/userOrders/OrderDetails";
import { EyeIcon, LoadingIcon } from "../icons";
import { useEffect, useState } from "react";
import {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/app/[locale]/orders/OrdersData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import { Button } from "../ui/button";
import { Save } from "lucide-react";

const OrderRows = ({
  orders: initialOrders,
  count,
  totalPages,
}: {
  orders: Order[];
  count: number;
  totalPages: number;
}) => {
  const t = useTranslations("orders");
  const lang = useLocale() as "en" | "ar";
  const { token } = useAppContext();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState<Order["id"] | false>(false);
  const paymentStatusOptions: PaymentStatus[] = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];
  const orderStatusOptions: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const headers: TableHeader[] = [
    { name: "id", className: "px-3 py-2", sortable: true, key: "id" },
    {
      name: "users",
      className: "px-3 py-2",
      sortable: true,
      key: "customer.full_name",
    },
    {
      name: "totalAmount",
      className: "px-3 py-2",
      sortable: true,
      key: "totalAmount",
    },
    { name: "items", className: "px-3 py-2" },
    {
      name: "status",
      className: "px-3 py-2",
      sortable: true,
      key: "status",
    },
    {
      name: "paymentStatus",
      className: "px-3 py-2",
      sortable: true,
      key: "paymentStatus",
    },
    {
      name: "createdAt",
      className: "px-3 py-2",
      sortable: true,
      key: "createdAt",
    },
    { name: "action", className: "flex justify-center items-center" },
  ];

  const handleUpdate = async (id: Order["id"]) => {
    setLoading(id);
    try {
      await axios.put<{ order: Order }>(
        `/api/orders/${id}`,
        {
          status: orders.find((o) => o.id === id)?.status,
          paymentStatus: orders.find((o) => o.id === id)?.paymentStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "accept-language": lang,
          },
        }
      );
      toast.success(t("updatedSuccessfully"));
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                dbSavedData: {
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                },
              }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("failedToUpdate"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus | PaymentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-white ring-offset-yellow-400 focus:ring-yellow-500";
      case "CONFIRMED":
      case "DELIVERED":
      case "PAID":
        return "bg-green-500 text-white ring-offset-green-500 focus:ring-green-500";
      case "SHIPPED":
        return "bg-blue-500 text-white ring-offset-blue-500 focus:ring-blue-500";
      case "PROCESSING":
        return "bg-orange-500 text-white ring-offset-orange-500 focus:ring-orange-500";
      case "CANCELLED":
      case "FAILED":
      case "REFUNDED":
        return "bg-red-500 text-white ring-offset-red-500 focus:ring-red-500";
      default:
        return "bg-gray-300 text-black ring-offset-gray-300 focus:ring-gray-500";
    }
  };

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
            {t("orders")}
          </h4>
        </div>
      </div>
      <Table
        headers={headers}
        pagination={
          <Pagination
            count={count}
            totalPages={totalPages}
            downloadButton={
              <DownloadButton<
                Order & {
                  "customer=full_name-phone": string;
                  "customer.full_name": string;
                }
              >
                model="order"
                fields={[
                  "id",
                  "customer=full_name-phone",
                  "totalAmount",
                  "status",
                  "paymentStatus",
                  "createdAt",
                ]}
                items={["customer.full_name"]}
              />
            }
          />
        }
      >
        {!orders.length && (
          <tr className="odd:bg-white even:bg-primary/5 border-b">
            <td
              colSpan={headers.length}
              scope="row"
              className="px-3 py-2 text-center font-bold"
            >
              {t("no data yet")}
            </td>
          </tr>
        )}
        {orders?.map((order, index) => (
          <tr
            key={order.id}
            className="odd:bg-white even:bg-[#F0F2F5] border-b"
          >
            <td className="px-3 py-2 whitespace-nowrap">{order.orderNumber}</td>
            <td className="px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="size-12">
                  <ImageApi
                    src={order?.customer?.image_url ?? "/imgs/notfound.png"}
                    alt="User Avatar"
                    className="size-full rounded-full object-cover border-2"
                    width={200}
                    height={200}
                  />
                </div>
                <Link
                  href={`/users/${order?.customer?.id}`}
                  className="whitespace-nowrap font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
                >
                  {order?.customer?.full_name}
                </Link>
              </div>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {t("totalPrice", { price: order.totalAmount })}
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {order?.items?.length ?? 0}
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <Select
                value={order.status}
                onValueChange={(value) => {
                  const newStatus = value as OrderStatus;
                  setOrders((prev) => {
                    const updated = [...prev];
                    updated[index] = { ...prev[index], status: newStatus };
                    return updated;
                  });
                }}
              >
                <SelectTrigger className={getStatusColor(order.status)}>
                  <SelectValue placeholder={t(order.status)} />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <Select
                defaultValue={order.paymentStatus}
                onValueChange={(value) => {
                  const newStatus = value as PaymentStatus;
                  setOrders((prev) => {
                    const updated = [...prev];
                    updated[index] = {
                      ...prev[index],
                      paymentStatus: newStatus,
                    };
                    return updated;
                  });
                }}
              >
                <SelectTrigger className={getStatusColor(order.paymentStatus)}>
                  <SelectValue placeholder={t(order.paymentStatus)} />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-black"
                    >
                      {t(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {DateToText(order.createdAt, lang)}
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {(order.status !== order.dbSavedData?.status ||
                order?.paymentStatus !== order.dbSavedData?.paymentStatus) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdate(order.id)}
                  type="button"
                  disabled={loading === order.id}
                >
                  {loading === order.id ? (
                    <LoadingIcon className="size-5 animate-spin" />
                  ) : (
                    <Save className="size-5" />
                  )}
                </Button>
              )}

              <Button
                onClick={() => setOrderDetails(order)}
                type="button"
                variant="ghost"
                size="icon"
                // className="text-primary hover:text-gray-700 transition-colors flex justify-center items-center size-full"
              >
                <EyeIcon className="size-5" />
              </Button>
            </td>
          </tr>
        ))}
      </Table>
      {orderDetails && (
        <OrderDetails
          order={orderDetails}
          open={!!orderDetails}
          setOpen={() => {
            setOrderDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderRows;
