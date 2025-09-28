import UserNotifications from "@/components/users/id/userNotifications/UserNotifications";
import { SearchParams } from "@/types/common";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

export interface UserNotification {
  id: string;
  desc: string;
  descAr?: string;
  title: string;
  titleAr?: string;
  createdAt: string;
  updateAt?: string;
  data: {
    notificationId: string;
    route: string;
    brandId: string;
  };
  read: boolean;
  userId?: string;
  user: any;
}

export interface UserNotificationsApiResponse {
  userNotifications: UserNotification[];
  totalUserNotifications: number;
  totalPages: number;
}

const fetchUserNotifications = async ({
  searchParams,
  userId,
  lang,
}: {
  searchParams: SearchParams;
  userId: string;
  lang: string;
}): Promise<{
  data: UserNotificationsApiResponse | null;
  error: string | null;
}> => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "-createdAt",
      userId,
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/notifications?${queryParams}`,
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
      return { data: null, error: await res.text() };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const UserNotificationsData = async ({
  params,
  searchParams,
}: {
  searchParams: SearchParams;
  params: { id: string };
}) => {
  const lang = await getLocale();
  const { data, error } = await fetchUserNotifications({
    searchParams,
    userId: params.id,
    lang,
  });

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;

  return (
    <UserNotifications
      totalPages={data.totalPages ?? 0}
      totalUserNotifications={data.totalUserNotifications ?? 0}
      userNotificationsData={data.userNotifications ?? []}
      userId={params.id}
    />
  );
};

export default UserNotificationsData;
