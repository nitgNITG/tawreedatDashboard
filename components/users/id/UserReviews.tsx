"use client";
import { UserReview } from "@/app/[locale]/users/[id]/UserReviewsData";
import { EyeIcon, LoadingIcon } from "@/components/icons";
import ImageApi from "@/components/ImageApi";
import Pagination from "@/components/ui/Pagination";
import Table, { TableHeader } from "@/components/ui/Table";
import { Link } from "@/i18n/routing";
import { DateToText } from "@/lib/DateToText";
import { Save, StarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface UserReviewsProps {
  reviews: UserReview[];
  totalCount: number;
  totalPages: number;
}

const UserReviews = ({ reviews, totalCount, totalPages }: UserReviewsProps) => {
  const t = useTranslations("user");
  const locale = useLocale() as "en" | "ar";
  const { token } = useAppContext();
  const [reviewDetails, setReviewDetails] = useState<UserReview | null>(null);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState<UserReview["id"] | boolean>(false);

  const statusOptions: ("PENDING" | "APPROVED" | "REJECTED")[] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];
  const headers: TableHeader[] = [
    { name: "date", sortable: true, key: "createdAt" },
    {
      name: "product",
      sortable: true,
      key: locale === "en" ? "product.name" : "product.nameAr",
    },
    { name: "review", sortable: true, key: "comment" },
    { name: "rating", sortable: true, key: "rating" },
    { name: "status", sortable: true, key: "status" },
    { name: "action", className: "flex justify-center items-center" },
  ];

  useEffect(() => {
    setUserReviews(reviews);
  }, []);
  const getStatusColor = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-white ring-offset-yellow-400 focus:ring-yellow-500";
      case "APPROVED":
        return "bg-green-500 text-white ring-offset-green-500 focus:ring-green-500";
      case "REJECTED":
        return "bg-red-500 text-white ring-offset-red-500 focus:ring-red-500";
      default:
        return "bg-gray-300 text-black ring-offset-gray-300 focus:ring-gray-500";
    }
  };

  const handleUpdate = async (id: UserReview["id"]) => {
    setLoading(id);
    try {
      await axios.put<{ review: UserReview }>(
        `/api/reviews/${id}`,
        {
          status: userReviews.find((o) => o.id === id)?.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      toast.success(t("updatedSuccessfully"));
      setUserReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                dbSavedData: {
                  status: review.status,
                },
              }
            : review
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("failedToUpdate"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div id="reviews">
      {reviewDetails && (
        <Dialog
          open={!!reviewDetails}
          onOpenChange={() => setReviewDetails(null)}
        >
          <DialogContent className="sm:max-w-lg max-h-full overflow-auto">
            <DialogHeader>
              <DialogTitle>{t("review details")}</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 h-[90%]">
              <div>
                <h3 className="font-semibold mb-2">{t("product")}:</h3>
                <div className="flex items-center gap-2">
                  <div className="size-12">
                    <ImageApi
                      src={
                        reviewDetails?.product?.images?.[0] ??
                        "/imgs/notfound.png"
                      }
                      alt="Product Image"
                      className="size-full rounded-lg object-cover border-2"
                      width={200}
                      height={200}
                    />
                  </div>
                  <Link
                    href={`/products/${reviewDetails?.product?.id}`}
                    className="whitespace-nowrap font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
                  >
                    {locale === "en"
                      ? reviewDetails.product.name
                      : reviewDetails.product.nameAr ??
                        reviewDetails.product.name}
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">{t("review")}:</h3>
              <p>{reviewDetails.comment || t("no comment")}</p>
              <h3 className="font-semibold mt-4 mb-2">{t("rating")}:</h3>
              <div className="flex items-center gap-2">
                {reviewDetails.rating}
                <StarIcon className="size-4 fill-yellow-400" />
              </div>
              <h3 className="font-semibold mt-4 mb-2">{t("status")}:</h3>
            </div>
            <p>{reviewDetails.status}</p>
          </DialogContent>
        </Dialog>
      )}
      <Table
        headers={headers}
        bgColor
        pagination={
          <Pagination bgColor count={totalCount} totalPages={totalPages} />
        }
      >
        {!userReviews.length && (
          <tr className="odd:bg-white even:bg-[#F6EEFA] border-b">
            <td
              colSpan={headers.length}
              scope="row"
              className="px-6 py-4 text-center font-bold"
            >
              {t("no data yet")}
            </td>
          </tr>
        )}
        {userReviews?.map((review, index) => (
          <tr
            key={review.id}
            className={"odd:bg-white even:bg-[#F6EEFA] border-b"}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              {DateToText(review.createdAt, locale)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="size-12">
                  <ImageApi
                    src={review?.product?.images?.[0] ?? "/imgs/notfound.png"}
                    alt="Product Image"
                    className="size-full rounded-lg object-cover border-2"
                    width={200}
                    height={200}
                  />
                </div>
                <Link
                  href={`/products/${review?.product?.id}`}
                  className="whitespace-nowrap font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
                >
                  {locale === "en"
                    ? review.product.name
                    : review.product.nameAr ?? review.product.name}
                </Link>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <p className="truncate max-w-[200px]" title={review.comment}>
                {review.comment}
              </p>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {" "}
              <div className="flex items-center gap-2">
                {review.rating}
                <StarIcon className="size-4 fill-yellow-400" />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Select
                defaultValue={review.status}
                onValueChange={(value) => {
                  const newStatus = value as
                    | "PENDING"
                    | "APPROVED"
                    | "REJECTED";
                  setUserReviews((prev) => {
                    const updated = [...prev];
                    updated[index] = {
                      ...prev[index],
                      status: newStatus,
                    };
                    return updated;
                  });
                }}
              >
                <SelectTrigger className={getStatusColor(review.status)}>
                  <SelectValue placeholder={t(review.status)} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="text-black"
                    >
                      {t(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex-center">
                {review.status !== review.dbSavedData?.status && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdate(review.id)}
                    type="button"
                    disabled={loading === review.id}
                  >
                    {loading === review.id ? (
                      <LoadingIcon className="size-5 animate-spin" />
                    ) : (
                      <Save className="size-5" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setReviewDetails(review);
                  }}
                  type="button"
                  className="text-primary hover:text-gray-700 transition-colors"
                >
                  <EyeIcon className="size-5" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default UserReviews;
