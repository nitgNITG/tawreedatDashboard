import { cookies } from "next/headers";
import { Ad } from "@/redux/reducers/adsReducer";
import AdsList from "@/components/ads/AdsList";
import { getLocale } from "next-intl/server";
import { SearchParams } from "@/types/common";

interface BadgeApiResponse {
  ads: Ad[];
  totalCount: number;
  totalPages: number;
}

const fetchAds = async (
  searchParams: SearchParams,
  lang: "en" | "ar" = "ar"
): Promise<{ data: BadgeApiResponse | null; error: string | null }> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      fields:
        "id,title,titleAr,description,descriptionAr,imageUrl,targetUrl,startDate,endDate,priority,status,adType,timing,displayDuration,createdAt",
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "priority",
      skip: searchParams.skip?.toString() ?? "0",
      lang,
    });

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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/ads?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
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
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const AdsData = async ({ searchParams }: { searchParams: SearchParams }) => {
  const lang = (await getLocale()) as "en" | "ar";
  const { data, error } = await fetchAds(searchParams, lang);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;

  return (
    <AdsList
      ads={data.ads}
      totalCount={data.totalCount}
      totalPages={data.totalPages}
    />
  );
};

export default AdsData;
