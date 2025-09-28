import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import { SearchParams } from "@/types/common";
import { cookies } from "next/headers";
import Brands from "@/components/brands/Brands";
import { Product } from "../products/productsData";
import { Category } from "../categories/categoriesData";

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

export interface Brand {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  coverUrl?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  products?: {
    id: number;
    product: Pick<Product, "id" | "name" | "nameAr" | "images">;
  }[];
  categories?: {
    id?: number;
    category: Pick<Category, "id" | "name" | "nameAr" | "iconUrl">;
  }[];
  isDeleted: boolean;
  isActive: boolean;
  isPopular: boolean;
}

interface BrandsApiResponse {
  brands: Brand[];
  totalBrands: number;
  totalPages: number;
}

const fetchBrands = async (
  searchParams: SearchParams,
  lang: "en" | "ar"
): Promise<{
  data: BrandsApiResponse | null;
  error: string | null;
}> => {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "-createdAt",
      fields:
        "id,name,slug,nameAr,description,descriptionAr,logoUrl,coverUrl,isActive,isDeleted,isPopular,products=id-name-nameAr-images,createdAt,categories=id-category=id-name-nameAr-iconUrl",
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/brands?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
        cache: "force-cache",
        next: { tags: ["brands", `${JSON.stringify(searchParams)}`] },
      }
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
    locale as "en" | "ar"
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

export default page;
