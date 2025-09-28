import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import { SearchParams } from "@/types/common";
import { cookies } from "next/headers";
import axios from "axios";
import Articles from "@/components/articles/Articles";

const page = ({
  searchParams,
  params: { locale },
}: {
  searchParams: SearchParams;
  params: { locale: string };
}) => {
  const key = JSON.stringify(searchParams);
  return (
    <div className="p-container space-y-10">
      <Suspense key={key} fallback={<LoadingTable />}>
        <ArticlesData locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  summary: string;
  coverImage: string;
  keywords: string[];
  publishedAt: string;
  author: string;
}

interface ArticlesApiResponse {
  articles: Article[];
  totalArticles: number;
  totalPages: number;
}

const fetchArticles = async (
  searchParams: SearchParams,
  lang: "en" | "ar"
): Promise<{
  data: ArticlesApiResponse | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "-createdAt",
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

    const { data } = await axios.get<ArticlesApiResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );

    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const ArticlesData = async ({
  searchParams,
  locale,
}: {
  searchParams: SearchParams;
  locale: string;
}) => {
  const { data, error } = await fetchArticles(
    searchParams,
    locale as "en" | "ar"
  );

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;
  return (
    <Articles
      articles={data.articles}
      count={data.totalArticles}
      totalPages={data.totalPages}
    />
  );
};

export default page;
