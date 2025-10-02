import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { SearchParams } from "@/types/common";
import { Review } from "../../products/productsData";
import UserReviews from "@/components/users/id/UserReviews";

export interface UserReview extends Review {
  product: {
    id: number;
    name: string;
    nameAr?: string;
    images?: string[];
  };
  dbSavedData: {
    status: "PENDING" | "APPROVED" | "REJECTED";
  };
}

interface UserReviewsApiResponse {
  reviews: UserReview[];
  totalCount: number;
  totalPages: number;
}

const fetchUserReviews = async ({
  searchParams,
  userId,
  lang,
}: {
  searchParams: SearchParams;
  userId: string;
  lang: string;
}): Promise<{ data: UserReviewsApiResponse | null; error: string | null }> => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };
    console.log('\x1b[33m searchParams: \x1b[0m', searchParams);
    

    const queryParams = new URLSearchParams({
      limit: searchParams.limit?.toString() ?? "10",
      sort: searchParams["reviews.sort"]?.toString() ?? "-createdAt",
      fields:
        "id,rating,comment,createdAt,status,product=id-name-nameAr-images",
    });

    if (searchParams["reviews.keyword"])
      queryParams.append("keyword", searchParams["reviews.keyword"].toString());
    if (searchParams.skip)
      queryParams.append("skip", searchParams.skip.toString());
    if (searchParams.items)
      queryParams.append("items", searchParams.items.toString());
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
      console.log('\x1b[33m queryParams: \x1b[0m', queryParams.toString());
      

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/reviews?${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        next: {
          tags: [`user-reviews-${userId}`, `${JSON.stringify(searchParams)}`],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      if (error.message === "walletNotFound") {
        return { data: null, error: "walletNotFound" };
      }
      return {
        data: null,
        error: error.message ?? "Failed to fetch user orders",
      };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
};

const UserReviewsData = async ({
  params,
  searchParams,
}: {
  searchParams: SearchParams;
  params: { id: string };
}) => {
  console.log('\x1b[33m hi from user reviews data \x1b[0m');

  const lang = await getLocale();
  const { data, error } = await fetchUserReviews({
    searchParams,
    userId: params.id,
    lang,
  });

  if (error && error !== "walletNotFound")
    return <div className="text-red-500">Error: {error}</div>;

  return (
    <UserReviews
      totalPages={data?.totalPages ?? 0}
      reviews={
        data?.reviews
          ? data.reviews.map((review) => ({
              ...review,
              dbSavedData: { status: review.status },
            }))
          : []
      }
      totalCount={data?.totalCount ?? 0}
    />
  );
};

export default UserReviewsData;
