"use client";
import React, { useState, useEffect } from "react";
import { Article as ArticleType } from "@/app/[locale]/articles/page";
import { useLocale, useTranslations } from "next-intl";
import {
  EditIcon,
  CalendarDays,
  User,
  Eye,
  Tag,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import ImageApi from "../ImageApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import AddArticle from "./AddArticle";
import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import axios from "axios";
import { DeleteIcon, LoadingIcon } from "../icons";
import { DateToText } from "@/lib/DateToText";

interface ArticleProps {
  article: ArticleType;
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);
  const [openDelete, setOpenDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const t = useTranslations("article");
  const locale = useLocale() as "en" | "ar";
  const isRTL = locale === "ar";
  const { token } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    setCurrentArticle(article);
  }, [article]);

  const handleDeleteArticle = async () => {
    if (!token) return;
    const id = openDelete;
    setLoading(true);
    try {
      await axios.delete(`/api/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": locale,
        },
      });
      toast.success(t("article_deleted"));
      router.push("/articles?skip=0");
    } catch (error: any) {
      toast.error(error?.message || t("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  const renderKeywords = () => {
    if (!currentArticle.keywords || currentArticle.keywords.length === 0)
      return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {currentArticle.keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            <Tag className="size-3" />
            {keyword}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          {isRTL ? (
            <ArrowRight className="size-4" />
          ) : (
            <ArrowLeft className="size-4" />
          )}
          {t("backToArticles", { defaultMessage: "Back to Articles" })}
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Image */}
        <div className="relative h-80 w-full">
          <ImageApi
            src={currentArticle.coverImage}
            alt={currentArticle.title}
            className="w-full h-full object-cover"
            width={800}
            height={320}
          />

          {/* Edit Button */}
          <div className="absolute top-4 end-4 flex gap-2 items-center">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-white/95 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              aria-label={t("editArticle")}
            >
              <EditIcon className="size-4 md:size-5 text-primary" />
            </button>
            <button
              onClick={() => setOpenDelete(currentArticle.id)}
              className="bg-white/95 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              aria-label={t("deleteArticle")}
            >
              <DeleteIcon className="size-4 md:size-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {currentArticle.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span>{currentArticle.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>{DateToText(currentArticle.publishedAt, locale)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="size-4" />
              <span>{t("published", { defaultMessage: "Published" })}</span>
            </div>
          </div>

          {/* Summary */}
          {currentArticle.summary && (
            <div className="bg-gray-50 rounded-lg p-6 border-s-4 border-primary">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("summary")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {currentArticle.summary}
              </p>
            </div>
          )}

          {/* Keywords */}
          {renderKeywords()}

          {/* Content */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-6 text-xl">
              {t("content")}
            </h3>
            <div
              className="text-gray-700 leading-relaxed space-y-4 
                         prose prose-lg max-w-none
                         prose-headings:text-gray-900 prose-headings:font-semibold
                         prose-p:text-gray-700 prose-p:leading-relaxed
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900 prose-strong:font-semibold
                         prose-ul:text-gray-700 prose-ol:text-gray-700
                         prose-li:text-gray-700 prose-blockquote:text-gray-600
                         prose-blockquote:border-l-primary prose-blockquote:bg-gray-50
                         prose-code:text-primary prose-code:bg-gray-100
                         prose-pre:bg-gray-900 prose-pre:text-white"
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
            />
          </div>

          {/* Article Footer */}
          <div className="border-t pt-6 mt-8">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {t("createdAt")}: {DateToText(currentArticle.createdAt, locale)}
              </span>
              {currentArticle.updatedAt !== currentArticle.createdAt && (
                <span>
                  {t("updatedAt")}:{" "}
                  {DateToText(currentArticle.updatedAt, locale)}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Edit Article Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("editArticle")}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <AddArticle
            setArticle={setCurrentArticle}
            setOpen={setIsEditOpen}
            article={currentArticle}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!openDelete} onOpenChange={() => setOpenDelete(null)}>
        <DialogContent className="bg-white p-0 rounded-lg">
          <div className="p-6 space-y-6">
            <DialogHeader className="space-y-4 text-center">
              <DialogTitle className="text-xl font-bold text-black">
                {t("deleteConfirmTitle")}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-base">
                {t("deleteConfirm")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-4 p-4">
              <button
                onClick={handleDeleteArticle}
                className="bg-primary justify-center items-center flex hover:bg-primary/80 px-8 py-2 rounded-3xl text-white transition-colors w-28"
              >
                {loading ? (
                  <LoadingIcon className="size-5 animate-spin" />
                ) : (
                  t("yes")
                )}
              </button>
              <button
                onClick={() => setOpenDelete(null)}
                className="bg-white border border-gray-700 drop-shadow-2xl font-bold hover:bg-gray-200 px-8 py-2 rounded-3xl text-black transition-colors w-28"
              >
                {t("no")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Article;
