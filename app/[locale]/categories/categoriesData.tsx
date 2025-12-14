import Categories from "@/components/category/Categories";
import { SearchParams } from "@/types/common";

export interface Category {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  imageUrl?: string;
  iconUrl?: string;
  parentId?: number;
  parent?: Partial<Category>;
  children?: Partial<Category>;
  products?: Partial<Product[]>;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  sortId: number;
  _count?: {
    children?: number;
    products?: number;
    brands?: number;
  };
  productAttributes?: {
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
  imageUrl?: string;
  price: number;
  discountPrice?: number;
  brandId: number;
  categoryId: number;
}

interface CategoryApiResponse {
  categories: Category[];
  totalCount: number;
  totalPages: number;
  parentCategory?: {
    name: string;
    nameAr?: string;
    parent?: {
      name: string;
      nameAr?: string;
    };
  }; // Add parent category info
}

export const fetchCategories = async (
  searchParams: SearchParams,
  locale: string,
  parentName?: string
): Promise<{
  data: CategoryApiResponse | null;
  error: string | null;
}> => {
  try {
    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams.sort?.toString() ?? "sortId",
      fields:
        "id,name,nameAr,description,descriptionAr,productAttributes,imageUrl,iconUrl,parent=id-name,createdAt,isActive,sortId,_count=children-products-brands",
    });

    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (parentName)
      queryParams.append("parent[name]", decodeURIComponent(parentName.trim()));
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
    if (searchParams.isActive)
      queryParams.append("isActive", searchParams.isActive.toString());
    if (searchParams.parentId) {
      queryParams.append("parentId", searchParams.parentId.toString());
      if (searchParams["parentId[not]"]) queryParams.delete("parentId[not]");
    }
    if (searchParams["parentId[not]"]) {
      queryParams.append(
        "parentId[not]",
        searchParams["parentId[not]"].toString()
      );
      if (searchParams.parentId) queryParams.delete("parentId");
    }
    if (searchParams.hasProducts)
      queryParams.append(
        searchParams.hasProducts === "true"
          ? "products[some]"
          : "products[none]",
        JSON.stringify({})
      );
    if (searchParams.hasBrands)
      queryParams.append(
        searchParams.hasBrands === "true" ? "brands[some]" : "brands[none]",
        JSON.stringify({})
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
    parentName
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
