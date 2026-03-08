import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import { SearchParams } from "@/types/common";
import { cookies } from "next/headers";
import Brands from "@/components/brands/Brands";
import { Product } from "../products/productsData";
import { Category } from "../categories/categoriesData";

export interface Brand {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  cover_url?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  slug: string;
  products?: {
    id: number;
    product: Pick<Product, "id" | "name" | "name_ar" | "images">;
  }[];
  categories?: {
    id?: number;
    category: Pick<Category, "id" | "name" | "name_ar" | "icon_url">;
  }[];
  is_active: boolean;
  is_popular: boolean;
  sort_id: number;
}

interface BrandsApiResponse {
  brands: Brand[];
  totalBrands: number;
  totalPages: number;
}

const fetchBrands = async (
  searchParams: SearchParams,
  lang: "en" | "ar",
): Promise<{
  data: BrandsApiResponse | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "sort_id",
      fields:
        "id,name,slug,name_ar,description,description_ar,logo_url,cover_url,is_active,sort_id,deleted_at,is_popular,products=id-name-name_ar-images,created_at,categories=id-category=id-name-name_ar-icon_url",
    });

    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (searchParams["created_at[gte]"])
      queryParams.append(
        "created_at[gte]",
        searchParams["created_at[gte]"].toString(),
      );
    if (searchParams["created_at[lte]"])
      queryParams.append(
        "created_at[lte]",
        searchParams["created_at[lte]"].toString(),
      );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/brands?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
        // cache: "force-cache",
        // next: { tags: ["brands", `${JSON.stringify(searchParams)}`] },
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch brands: ${res.statusText}`);
    }
    const data: BrandsApiResponse = await res.json();

    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const BrandsData = async ({
  searchParams,
  locale,
}: {
  searchParams: SearchParams;
  locale: string;
}) => {
  const { data, error } = await fetchBrands(
    searchParams,
    locale as "en" | "ar",
  );

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">no data</div>;
  return (
    <Brands
      brands={data.brands}
      totalBrands={data.totalBrands}
      totalPages={data.totalPages}
    />
  );
};

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
        <BrandsData locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
};
export default page;
