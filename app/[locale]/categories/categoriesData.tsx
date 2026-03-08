import Categories from "@/components/category/Categories";
import { SearchParams } from "@/types/common";

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  icon_url?: string;
  parent_id?: number;
  parent?: Partial<Category>;
  children?: Partial<Category>;
  products?: Partial<Product[]>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_active: boolean;
  sort_id: number;
  _count?: {
    children?: number;
    products?: number;
    brands?: number;
  };
  product_attributes?: {
    [key: string]: {
      type: "string" | "number" | "boolean";
      required?: boolean;
      default?: string | number | boolean;
      enum?: string[] | number[];
    };
  };
}
export interface Product {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  discountPrice?: number;
  brand_id: number;
  category_id: number;
}

interface CategoryApiResponse {
  categories: Category[];
  totalCount: number;
  totalPages: number;
  parentCategory?: {
    name: string;
    name_ar?: string;
    parent?: {
      name: string;
      name_ar?: string;
    };
  }; // Add parent category info
}

export const fetchCategories = async (
  searchParams: SearchParams,
  locale: string,
  parentName?: string,
): Promise<{
  data: CategoryApiResponse | null;
  error: string | null;
}> => {
  try {
    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "sort_id",
      fields:
        "id,name,name_ar,description,description_ar,product_attributes,image_url,icon_url,parent=id-name,created_at,is_active,sort_id,_count=children-products-brands",
    });

    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (parentName)
      queryParams.append("parent[name]", decodeURIComponent(parentName.trim()));
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
    if (searchParams.isActive)
      queryParams.append("is_active", searchParams.isActive.toString());
    if (searchParams.parentId) {
      queryParams.append("parent_id", searchParams.parentId.toString());
      if (searchParams["parent_id[not]"]) queryParams.delete("parentId[not]");
    }
    if (searchParams["parentId[not]"]) {
      queryParams.append(
        "parent_id[not]",
        searchParams["parentId[not]"].toString(),
      );
      if (searchParams.parentId) queryParams.delete("parentId");
    }
    if (searchParams.hasProducts)
      queryParams.append(
        searchParams.hasProducts === "true"
          ? "products[some]"
          : "products[none]",
        JSON.stringify({}),
      );
    if (searchParams.hasBrands)
      queryParams.append(
        searchParams.hasBrands === "true" ? "brands[some]" : "brands[none]",
        JSON.stringify({}),
      );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store", // or "default"
        // next: { tags: [`categories`, `${JSON.stringify(searchParams)}`] },
        headers: {
          "accept-language": locale,
        },
      },
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

const CategoriesData = async ({
  searchParams,
  locale,
  parentName,
  categoryPath,
}: {
  searchParams: SearchParams;
  locale: string;
  parentName?: string;
  categoryPath?: string[];
}) => {
  const { data, error } = await fetchCategories(
    searchParams,
    locale,
    parentName,
  );

  if (error) return <div className="text-red-500">Error: {error}</div>;
  return (
    <Categories
      title={parentName ? "subCategories" : "categories"}
      categories={data?.categories ?? []}
      count={data?.totalCount ?? 0}
      totalPages={data?.totalPages ?? 0}
      parentName={parentName}
      categoryPath={categoryPath}
    />
  );
};

export default CategoriesData;
