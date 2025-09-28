import { cookies } from "next/headers";
import OrderRows from "@/components/orders/OrderRows";
import { User } from "@/redux/reducers/usersReducer";
import { Product } from "../products/productsData";
import { SearchParams } from "@/types/common";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD";
export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: number;
  quantity: number;
  price?: number;
  createdAt?: string;
  order?: Order;
  product?: Partial<Product>;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: string;
  totalAmount: number;
  shippingCost: number;
  discount: number;
  taxAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  customer?: Partial<User>;
  items?: OrderItem[];
  dbSavedData: {
    status: OrderStatus;
    paymentStatus: PaymentStatus;
  };
}

interface OrderApiResponse {
  orders: Order[];
  totalCount: number;
  totalPages: number;
}

const fetchOrders = async (
  searchParams: SearchParams,
  locale: string
): Promise<{
  data: OrderApiResponse | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "-createdAt",
      fields:
        "id,orderNumber,totalAmount,shippingCost,discount,taxAmount,status,paymentMethod,paymentStatus,shippingAddress,notes,createdAt,customer=id-fullname-imageUrl,items=id-quantity-price-product=id-name-nameAr-images",
    });
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());

    if (searchParams["createdAt[gte]"])
      queryParams.append(
        "createdAt[gte]",
        searchParams["createdAt[gte]"].toString()
      );
    if (searchParams["createdAt[lte]"])
      queryParams.append(
        "createdAt[lte]",
        searchParams["createdAt[lte]"].toString()
      );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": locale,
        },
      }
    );

    if (!res.ok) {
      return { data: null, error: await res.text() };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const OrdersData = async ({
  searchParams,
  locale,
}: {
  searchParams: SearchParams;
  locale: string;
}) => {
  const { data, error } = await fetchOrders(searchParams, locale);

  if (error)
    return (
      <div className="text-red-500">Error: {error ?? "An error occurred"}</div>
    );

  return (
    <OrderRows
      orders={
        data?.orders
          ? data.orders.map((order) => ({
              ...order,
              dbSavedData: {
                status: order.status,
                paymentStatus: order.paymentStatus,
              },
            }))
          : []
      }
      count={data?.totalCount ?? 0}
      totalPages={data?.totalPages ?? 0}
    />
  );
};

export default OrdersData;
