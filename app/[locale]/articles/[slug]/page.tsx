import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import { cookies } from "next/headers";
import axios from "axios";
import { Article } from "../page";
import ArticleView from "@/components/articles/Article";

const page = ({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) => {
  return (
    <div className="p-container space-y-10">
      <Suspense fallback={<LoadingTable />}>
        <ArticleData locale={locale} slug={slug} />
      </Suspense>
    </div>
  );
};

const fetchArticle = async (
  slug: string,
  lang: "en" | "ar"
): Promise<{
  data: { article: Article } | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const { data } = await axios.get<{ article: Article }>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${slug}`,
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

const ArticleData = async ({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) => {
  const { data, error } = await fetchArticle(slug, locale as "en" | "ar");

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;

  return <ArticleView article={data.article} />;
};

export default page;
