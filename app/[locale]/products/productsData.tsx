import Products from "@/components/products/Products";
import { Category } from "../categories/categoriesData";
import { OrderItem } from "../orders/OrdersData";
import { SearchParams } from "@/types/common";
import { Brand } from "../brands/page";

export const PRODUCTS_FIELDS =
  "id,sort_id,name,name_ar,description,description_ar,attributes,images,price,stock,created_at,is_active,is_featured,offer,offer_valid_from,offer_valid_to,rating,total_reviews,category=id-name-name_ar-product_attributes,brand=id-name-name_ar-logo_url" as const;
interface AttributesItem {
  key: string;
  value: string;
  value_ar: string;
  id: number;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  userId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  productId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  images?: string[];
  price: number;
  cost_price?: number;
  offer: number;
  offer_valid_from?: string;
  offer_valid_to?: string;
  stock: number;
  min_stock?: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  category?: Partial<Category>;
  brand?: Pick<Brand, "id" | "name" | "name_ar" | "logo_url">;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  category_id: number;
  brand_id?: number;
  is_featured: boolean;
  supplier_id?: number;
  supplier?: any;
  order_items?: OrderItem[];
  cart_items?: any[];
  rating: number;
  total_reviews: number;
  reviews?: Review[];
  wishlist?: any[];
  attributes?: AttributesItem[];
  sort_id: number;
}

interface ProductApiResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

export const fetchProducts = async (
  searchParams: SearchParams,
  locale: string,
  categoryName?: string,
): Promise<{
  data: ProductApiResponse | null;
  error: string | null;
}> => {
  try {
    let queryParams = new URLSearchParams({
      limit:
        (categoryName
          ? searchParams.limitArchive?.toString()
          : searchParams.limit?.toString()) ?? "10",
      sort:
        (categoryName
          ? searchParams.sortArchive?.toString()
          : searchParams.sort?.toString()) ?? "sort_id",
      fields: PRODUCTS_FIELDS,
    });

    if (searchParams.skip && !categoryName)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword && !categoryName)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (categoryName)
      queryParams.append(
        "category[name]",
        decodeURIComponent(categoryName.trim()),
      );
    if (searchParams.skipArchive && categoryName)
      queryParams.append("skip", searchParams.skipArchive.toString());
    if (searchParams.keywordArchive && categoryName)
      queryParams.append("keyword", searchParams.keywordArchive.toString());
    if (searchParams.isFeatured && !categoryName)
      queryParams.append("is_featured", searchParams.isFeatured.toString());
    if (searchParams.isActive && !categoryName)
      queryParams.append("is_active", searchParams.isActive.toString());

    if (searchParams.isFeaturedArchive && !categoryName)
      queryParams.append(
        "is_featured",
        searchParams.isFeaturedArchive.toString(),
      );
    if (searchParams.isActiveArchive && !categoryName)
      queryParams.append("is_active", searchParams.isActiveArchive.toString());

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        // cache: "force-cache",
        // next: { tags: [`products`, `${JSON.stringify(searchParams)}`] }, // enables cache per searchParams
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

const ProductsData = async ({
  searchParams,
  locale,
  categoryName,
}: {
  searchParams: SearchParams;
  locale: string;
  categoryName?: string;
}) => {
  const { data, error } = await fetchProducts(
    searchParams,
    locale,
    categoryName,
  );

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Products
      products={data?.products ?? []}
      count={data?.totalProducts ?? 0}
      totalPages={data?.totalPages ?? 0}
      categoryName={categoryName}
    />
  );
};

export default ProductsData;
