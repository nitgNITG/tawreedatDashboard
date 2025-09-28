import { ContactState } from "@/types/contact";
import { cookies } from "next/headers";
import Contact from "@/components/contact/Contact";
import { SearchParams } from "@/types/common";

const fetchContact = async (
  searchParams: SearchParams
): Promise<{
  data: ContactState | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "-createdAt,-name",
    });

    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/api/contact-us?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return { data: null, error: await res.text() };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Fetch error:", error);
    return { data: null, error: error?.message };
  }
};

const ContactData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const { data, error } = await fetchContact(searchParams);
  if (error) {
    console.error("Error fetching contact us:", error);
    return <div>Error fetching contact us</div>;
  }
  if (!data) {
    return <div>No data available</div>;
  }
  return (
    <Contact
      contacts={data.contacts ?? []}
      totalCount={data.totalCount ?? 0}
      totalPages={data.totalPages ?? 0}
    />
  );
};

export default ContactData;
