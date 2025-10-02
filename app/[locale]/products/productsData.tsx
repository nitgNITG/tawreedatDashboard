import Products from "@/components/products/Products";
import { Category } from "../categories/categoriesData";
import { OrderItem } from "../orders/OrdersData";
import { SearchParams } from "@/types/common";
import { Brand } from "../brands/page";

interface AttributesItem {
  key: string;
  value: string;
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
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  images?: string[];
  price: number;
  costPrice?: number;
  offer: number;
  stock: number;
  minStock?: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  category?: Partial<Category>;
  brand?: Pick<Brand, "id" | "name" | "nameAr" | "logoUrl">;
  createdAt: string;
  updatedAt?: string;
  categoryId: number;
  brandId?: number;
  isFeatured: boolean;
  supplierId?: number;
  supplier?: any;
  orderItems?: OrderItem[];
  cartItems?: any[];
  rating: number;
  totalReviews: number;
  reviews?: Review[];
  wishlist?: any[];
  bookDetails?: any;
  attributes?: AttributesItem[];
}

interface ProductApiResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

export const fetchProducts = async (
  searchParams: SearchParams,
  locale: string,
  categoryName?: string
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
          : searchParams.sort?.toString()) ?? "-createdAt",
      fields:
        "id,name,nameAr,description,descriptionAr,attributes,images,price,stock,createdAt,isActive,isFeatured,offer,rating,totalReviews,category=id-name-nameAr-productAttributes,brand=id-name-nameAr-logoUrl",
    });

    if (searchParams.skip && !categoryName)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.keyword && !categoryName)
      queryParams.append("keyword", searchParams.keyword.toString());
    if (categoryName)
      queryParams.append(
        "category[name]",
        decodeURIComponent(categoryName.trim())
      );
    if (searchParams.skipArchive && categoryName)
      queryParams.append("skip", searchParams.skipArchive.toString());
    if (searchParams.keywordArchive && categoryName)
      queryParams.append("keyword", searchParams.keywordArchive.toString());
    if (searchParams.isFeatured && !categoryName)
      queryParams.append("isFeatured", searchParams.isFeatured.toString());
    if (searchParams.isActive && !categoryName)
      queryParams.append("isActive", searchParams.isActive.toString());

    if (searchParams.isFeaturedArchive && !categoryName)
      queryParams.append(
        "isFeatured",
        searchParams.isFeaturedArchive.toString()
      );
    if (searchParams.isActiveArchive && !categoryName)
      queryParams.append("isActive", searchParams.isActiveArchive.toString());

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        // cache: "no-cache",
        cache: "force-cache", // or "default"
        next: { tags: [`products`, `${JSON.stringify(searchParams)}`] }, // enables cache per searchParams
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
    categoryName
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
