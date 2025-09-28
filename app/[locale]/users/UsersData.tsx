import UsersRows from "@/components/users/UsersRows";
import { User } from "@/redux/reducers/usersReducer";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { SearchParams } from "@/types/common";

interface UserApiResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
}

const fetchUser = async (
  searchParams: SearchParams,
  lang: "en" | "ar"
): Promise<{
  data: UserApiResponse | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      fields: "id,fullname,phone,imageUrl,email,isDeleted,createdAt,role",
      limit: searchParams.limit?.toString() ?? "10",
      items: "fullname,phone,email",
      sort: searchParams.sort?.toString() ?? "-createdAt,-fullname",
    });

    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?${queryParams}`,
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

const UsersData = async ({ searchParams }: { searchParams: SearchParams }) => {
  const lang = (await getLocale()) as "en" | "ar";
  const { data, error } = await fetchUser(searchParams, lang);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;

  return (
    <UsersRows
      users={data.users}
      count={data.totalUsers}
      totalPages={data.totalPages}
    />
  );
};

export default UsersData;
