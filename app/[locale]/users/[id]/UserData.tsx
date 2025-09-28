import UserDetails from "@/components/users/id/UserDetails";
import { fetchData } from "@/lib/fetchData";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

const UserData = async ({ params }: { params: { id: string } }) => {
  const locale = (await getLocale()) || "ar";
  const token = cookies().get("token")?.value;
  console.log(token);

  const { data, error } = await fetchData(`/api/users/${params.id}`, {
    headers: { Authorization: `Bearer ${token}`, "accept-language": locale },
  });

  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data) return <div className="text-red-500">no data</div>;

  return <UserDetails user={data.user} />;
};
export default UserData;
