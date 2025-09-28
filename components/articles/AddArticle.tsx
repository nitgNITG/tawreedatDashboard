"use client";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LoadingIcon, PhotoIcon } from "../icons";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { useAppContext } from "@/context/appContext";

import ImageApi from "../ImageApi";
import { Article } from "@/app/[locale]/articles/page";
import { OutlineInput, OutlineTextArea } from "../ui/OutlineInputs";
import { CalendarDays } from "lucide-react";

interface AddArticleProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  article?: Article;
  setArticles?: React.Dispatch<React.SetStateAction<Article[]>>;
  setArticle?: React.Dispatch<React.SetStateAction<Article>>;
}

const AddArticle: React.FC<AddArticleProps> = ({
  setOpen,
  article,
  setArticles,
  setArticle,
}) => {
  const [previewImage, setPreviewImage] = useState(article?.coverImage ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  // Keywords state
  const [keywords, setKeywords] = useState<string[]>(
    typeof article?.keywords === "string"
      ? JSON.parse(article.keywords || "[]")
      : Array.isArray(article?.keywords)
      ? article.keywords
      : []
  );
  const [currentKeyword, setCurrentKeyword] = useState("");

  // Keywords handlers
  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    let input: string | string[] = currentKeyword.trim();
    if (!input) return;

    // Only allow single keyword, do not split by comma or brackets
    // Remove brackets if user pasted them
    if (input.startsWith("[") && input.endsWith("]")) {
      input = input.slice(1, -1).trim();
      input = input
        .split(",")
        .map((kw) => kw.trim().replace(/^(?:\")|(?:\")$/g, ""));
    }

    // Prevent empty or duplicate keywords
    if (Array.isArray(input)) {
      const newKeywords = input.filter((kw) => kw && !keywords.includes(kw));
      if (newKeywords.length > 0) {
        setKeywords([...keywords, ...newKeywords]);
      }
    } else if (input && !keywords.includes(input)) {
      setKeywords([...keywords, input]);
    }
    setCurrentKeyword("");
  };

  const removeKeyword = (indexToRemove: number) => {
    setKeywords(keywords.filter((_, index) => index !== indexToRemove));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      title: article?.title || "",
      slug: article?.slug || undefined,
      content: article?.content || "",
      coverImage: article?.coverImage || "",
      summary: article?.summary || "",
      publishedAt: article?.publishedAt
        ? new Date(article.publishedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0], // Default to today's date
      author: article?.author || "",
      keywords: article?.keywords || [],
    },
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("article");
  const { token } = useAppContext();

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsImageLoading(true);
        setImageFile(file);
        const tempUrl = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = tempUrl;
          img.onload = resolve;
          img.onerror = reject;
        });

        setPreviewImage(tempUrl);
      } catch (error) {
        console.error("Error loading image:", error);
        toast.error(t("error.image_load_failed"));
      } finally {
        setIsImageLoading(false);
      }
    }
  };
  const lang = useLocale() as "en" | "ar";

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (!article && !previewImage) {
        toast.error(t("error.error_image_required"));
        return;
      }

      if (keywords.length === 0) {
        toast.error(t("error.error_keywords_required"));
        setError("keywords", {
          type: "manual",
          message: t("error.error_keywords_required"),
        });
        return;
      }

      setLoading(true);
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("content", formData.content || "");
      submitFormData.append("summary", formData.summary || "");
      submitFormData.append("keywords", JSON.stringify(keywords));
      submitFormData.append(
        "publishedAt",
        formData.publishedAt ? new Date(formData.publishedAt).toISOString() : ""
      );
      submitFormData.append("author", formData.author || "");
      if (imageFile) {
        submitFormData.append("imageUrl", imageFile);
      }
      if (formData.slug) {
        submitFormData.append("slug", formData.slug);
      }

      if (article?.id) {
        const { data } = await axios.put(
          `/api/articles/${article.id}`,
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "accept-language": lang,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setArticles?.((prev) =>
          prev.map((item) =>
            item.id === data.article.id ? data.article : item
          )
        );
        setArticle?.(data.article);
        toast.success(t("success.update"));
      } else {
        const { data } = await axios.post(`/api/articles`, submitFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": lang,
            "Content-Type": "multipart/form-data",
          },
        });
        setArticles?.((prev) => [...prev, data.article]);
        toast.success(t("success.add"));
      }

      setOpen(false);
    } catch (error: any) {
      if (error.response?.data?.message.includes("slug_exists")) {
        setError("slug", {
          type: "manual",
          message: t("error.title_exists", {
            slug: error.response.data.slug,
          }),
        });
      }
      console.error("Submit Error:", error);
      toast.error(error?.response?.data?.message || t("error.general"));
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      className="h-[90%] overflow-auto flex flex-col gap-4 pb-2 px-2"
      onSubmit={onSubmit}
    >
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
      />

      <div className="relative h-72">
        <div
          onClick={handleImageClick}
          className="cursor-pointer flex justify-center items-center rounded-lg overflow-hidden bg-slate-100"
        >
          {isImageLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingIcon className="w-10 h-10 animate-spin text-teal-500" />
              <span className="text-sm text-gray-500 mt-2">{t("loading")}</span>
            </div>
          ) : previewImage ? (
            <div className="relative group h-72 flex justify-center items-center">
              <ImageApi
                src={previewImage}
                alt="Category"
                height={64}
                width={48}
                className="w-48 object-contain rounded-3xl"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg">
                <PhotoIcon className="size-10 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <PhotoIcon className="size-10 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">
                {t("clickToUpload")}
              </span>
            </div>
          )}
        </div>
      </div>

      <OutlineInput
        {...register("title", { required: t("error.title_required") })}
        label={t("title")}
        id="title"
        error={errors.title?.message as string}
      />

      <OutlineInput
        {...register("slug", { required: false })}
        label={t("slug")}
        id="slug"
        error={errors.slug?.message as string}
      />

      <OutlineInput
        {...register("author", { required: t("error.author_required") })}
        label={t("author")}
        id="author"
        error={errors.author?.message as string}
      />

      <OutlineTextArea
        label={t("summary")}
        {...register("summary", { required: t("error.summary_required") })}
        id="summary"
        error={errors.summary?.message as string}
      />

      <OutlineTextArea
        label={t("content")}
        {...register("content", { required: t("error.content_required") })}
        id="content"
        error={errors.content?.message as string}
      />

      <div className="relative">
        <OutlineInput
          {...register("publishedAt", {
            required: t("error.publishedAt_required"),
          })}
          label={t("publishedAt")}
          id="article-publishedAt"
          type="date"
          className="hideCalendarIcon"
          iconEnd={{
            child: (
              <button
                type="button"
                className="absolute end-3 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const input = document.getElementById(
                    "article-publishedAt"
                  ) as HTMLInputElement;
                  input?.showPicker?.();
                }}
              >
                <CalendarDays className="text-primary size-5" />
              </button>
            ),
          }}
          error={errors.publishedAt?.message as string}
        />
      </div>

      {/* Keywords Input */}
      <div className="relative w-full">
        <OutlineInput
          label={t("keywords")}
          id="keywords"
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyDown={handleKeywordKeyPress}
          error={errors.keywords?.message as string}
        />
        {/* Keywords Tags */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword, index) => (
              <span
                key={keyword}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-white"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="ml-2 hover:bg-primary rounded-full p-0.5 focus:outline-none"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-white duration-200 flex justify-center"
        >
          {loading ? (
            <LoadingIcon className="w-4 h-4 animate-spin" />
          ) : article ? (
            t("button_submit_edit")
          ) : (
            t("button_submit_add")
          )}
        </button>
      </div>
    </form>
  );
};

export default AddArticle;
