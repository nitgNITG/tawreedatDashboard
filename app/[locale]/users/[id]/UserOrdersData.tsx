import UserOrders from "@/components/users/id/userOrders/UserOrders";
import { cookies } from "next/headers";
import { Order, OrderStatus } from "../../orders/OrdersData";
import { getLocale } from "next-intl/server";
import { SearchParams } from "@/types/common";

export type orderSums = {
  [key in OrderStatus]?: number;
};

interface UserOrdersApiResponse {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  orderSums: orderSums;
}

const fetchUserOrders = async ({
  searchParams,
  userId,
  lang,
}: {
  searchParams: SearchParams;
  userId: string;
  lang: string;
}): Promise<{ data: UserOrdersApiResponse | null; error: string | null }> => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      // items: "brand.name",
      sort: searchParams.sort?.toString() ?? "-createdAt",
      fields:
        "id,orderNumber,totalAmount,shippingCost,discount,taxAmount,status,paymentMethod,paymentStatus,shippingAddress,notes,createdAt,items=id-quantity-price-product=id-name-nameAr-images",
    });

    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.items)
      queryParams.append("items", searchParams.items.toString());
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/orders?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      if (error.message === "walletNotFound") {
        return { data: null, error: "walletNotFound" };
      }
      return {
        data: null,
        error: error.message ?? "Failed to fetch user orders",
      };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const UserOrdersData = async ({
  params,
  searchParams,
}: {
  searchParams: SearchParams;
  params: { id: string };
}) => {
  const lang = await getLocale();
  const { data, error } = await fetchUserOrders({
    searchParams,
    userId: params.id,
    lang,
  });

  if (error && error !== "walletNotFound")
    return <div className="text-red-500">Error: {error}</div>;

  return (
    <UserOrders
      totalPages={data?.totalPages ?? 0}
      orders={data?.orders ?? []}
      totalCount={data?.totalCount ?? 0}
      sumOrders={
        data?.orderSums ?? {
          PENDING: 0,
          CONFIRMED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
        }
      }
    />
  );
};

export default UserOrdersData;
