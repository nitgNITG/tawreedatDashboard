"use client";
import React, { useEffect, useState } from "react";
import {
  DeleteIcon,
  EditIcon,
  LoadingIcon,
  PlusCircleIcon,
  EyeIcon,
} from "../icons";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import { CardTitle, CardDescription } from "../ui/card";
import SortDropdown from "../SortDropdown";
import { Link } from "@/i18n/routing";
import CardGridItem from "../ui/CardGridItem";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import { Article } from "@/app/[locale]/articles/page";
import axios from "axios";
import AddArticle from "./AddArticle";

interface ArticlesProps {
  articles: Article[];
  count: number;
  totalPages: number;
}

const Articles: React.FC<ArticlesProps> = ({
  articles: initArticles,
  count,
  totalPages,
}) => {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>(initArticles);
  const [openDelete, setOpenDelete] = useState<number | null>(null);
  const [updateArticle, setUpdateArticle] = useState<Article | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const { token } = useAppContext();
  const t = useTranslations("article");
  const locale = useLocale();

  const handleDeleteArticle = async () => {
    if (!token) return;
    const id = openDelete;
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      toast.success(t("article_deleted"));
      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error: any) {
      toast.error(error?.message || t("error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setArticles(initArticles);
  }, [initArticles]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
          {t("articles")}
        </h4>
        <div className="flex gap-2 items-center">
          <SortDropdown
            options={[
              { label: t("title"), value: "title" },
              { label: t("createdAt"), value: "createdAt" },
              { label: t("publishedAt"), value: "publishedAt" },
            ]}
          />
          <button
            onClick={() => {
              setOpen(true);
            }}
            className="px-5 py-2 bg-primary rounded-md text-white font-medium"
          >
            <div className="flex gap-3">
              <PlusCircleIcon className="size-6" />
              <div className="flex-1">{t("addArticle")}</div>
            </div>
          </button>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center font-bold py-8">{t("no_data_yet")}</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-8 bg-white rounded-3xl px-5 py-8">
          {articles.map((article, index) => (
            <CardGridItem
              key={article.id}
              isPriority={index < 6}
              cardContent={
                <div className="w-full flex flex-col items-start px-2">
                  <CardTitle className="text-base font-bold mb-1 truncate w-full">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-[0.7rem] text-gray-500 flex gap-2 items-center justify-center">
                    {article.summary}
                  </CardDescription>
                </div>
              }
              cardFooter={
                <div className="flex gap-2 justify-end w-full items-center">
                  <Link
                    href={`/articles/${article.slug}`}
                    aria-label={t("viewArticle")}
                  >
                    <EyeIcon className="size-4 text-primary hover:text-gray-700" />
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(true);
                      setUpdateArticle(article);
                    }}
                    aria-label={t("editArticle")}
                  >
                    <EditIcon className="size-4 text-primary hover:text-gray-700" />
                  </button>
                  <button
                    onClick={() => setOpenDelete(article.id)}
                    aria-label={t("deleteArticle")}
                  >
                    <DeleteIcon className="size-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              }
              image={{
                alt: article.title,
                url: article.coverImage,
              }}
            />
          ))}
        </div>
      )}
      <Pagination
        count={count}
        totalPages={totalPages}
        bgColor
        className="bg-transparent px-0"
        downloadButton={
          <DownloadButton<Article>
            fields={[
              "id",
              "title",
              "summary",
              "keywords",
              "publishedAt",
              "author",
              "createdAt",
            ]}
            model="Article"
          />
        }
      />

      {/* Add/Edit Article Dialog */}
      <Dialog
        open={open}
        onOpenChange={() => {
          setUpdateArticle(undefined);
          setOpen(false);
        }}
      >
        <DialogContent className="h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("articles")}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <AddArticle
            setArticles={setArticles}
            setOpen={setOpen}
            article={updateArticle}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
};

export default Articles;
