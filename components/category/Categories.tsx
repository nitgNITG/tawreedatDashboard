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
import PopupCategory from "./AddCategory";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  deleteCategory,
  setCategories,
} from "@/redux/reducers/categoriesReducer";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import { CardTitle, CardDescription } from "../ui/card";
import { Category } from "@/app/[locale]/categories/categoriesData";
import SortDropdown from "../SortDropdown";
import { Link } from "@/i18n/routing";
import CardGridItem from "../ui/CardGridItem";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import CategoryBreadcrumb from "./CategoryBreadcrumb";
import FilterDropdown, { FilterOption } from "../FilterDropdown";

interface CategoriesProps {
  categories: Category[]; //
  count: number;
  totalPages: number;
  title: string;
  parentName?: string;
  categoryPath?: string[];
}

const Categories: React.FC<CategoriesProps> = ({
  categories: initCategories,
  count,
  totalPages,
  title,
  parentName,
  categoryPath,
}) => {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState<number | null>(null);
  const [cateUpdate, setCateUpdate] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { token } = useAppContext();
  const t = useTranslations("category");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const categories: Category[] = useAppSelector(
    (state) => state.category.categories
  );
  const filterOptions: FilterOption[] = [
    {
      label: t("activeCategories"),
      value: "true",
      queryParam: "isActive",
    },
    {
      label: t("inactiveCategories"),
      value: "false",
      queryParam: "isActive",
    },
    {
      label: t("parentCategories"),
      value: "null",
      queryParam: "parentId",
    },
    {
      label: t("subCategories"),
      value: "null",
      queryParam: "parentId[not]",
    },
    {
      label: t("categoriesWithProducts"),
      value: "true",
      queryParam: "hasProducts",
    },
    {
      label: t("categoriesWithoutProducts"),
      value: "false",
      queryParam: "hasProducts",
    },
    {
      label: t("categoriesWithBrands"),
      value: "true",
      queryParam: "hasBrands",
    },
    {
      label: t("categoriesWithoutBrands"),
      value: "false",
      queryParam: "hasBrands",
    },
  ];

  useEffect(() => {
    dispatch(setCategories(initCategories));
  }, [initCategories, dispatch]);

  const handleDeleteCate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${openDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete category");

      dispatch(deleteCategory(openDelete));
      setOpenDelete(null);
      toast.success(t("successDelete"));

      // Refresh the current page after deletion
      //   fetchCategories(currentPage, pageSize);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CategoryBreadcrumb
        key={categoryPath?.join("-")}
        categoryPath={categoryPath}
        currentCategory={parentName}
      />
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg md:text-xl lg:text-2xl">{t(title)}</h4>
        <div className="flex gap-2 items-center">
          <FilterDropdown options={filterOptions} placeholder="filter" />
          <SortDropdown
            options={[
              { label: t("name"), value: "name" },
              { label: t("nameAr"), value: "nameAr" },
              { label: t("createdAt"), value: "createdAt" },
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
              <div className="flex-1">{t("addCategory")}</div>
            </div>
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center font-bold py-8">{t("no_data_yet")}</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-8 bg-white rounded-3xl px-5 py-8">
          {categories.map((category, index) => (
            <CardGridItem
              key={category.id}
              isPriority={index < 6}
              cardFooter={
                <>
                  <div className="w-full flex flex-col items-start px-2">
                    <CardTitle className="text-base font-bold mb-1 truncate w-full">
                      {locale === "ar" ? category.nameAr : category.name}
                    </CardTitle>
                    <CardDescription className="text-[0.7rem] text-gray-500 flex gap-2 items-center justify-center">
                      <span>
                        {category._count?.products || 0} {t("products")}
                      </span>
                      <span>
                        {category._count?.children || 0} {t("subCategories")}
                      </span>
                      <span>
                        {category._count?.brands || 0} {t("brands")}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 justify-center items-center">
                    <Link
                      href={`/categories/${
                        categoryPath
                          ? categoryPath
                              .map((cat) => cat.replace(/ /g, "-"))
                              .join("/") + "/"
                          : ""
                      }${category.name.replace(/ /g, "-")}`}
                      aria-label={t("viewCategory")}
                    >
                      <EyeIcon className="size-4 text-primary hover:text-gray-700" />
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(true);
                        setCateUpdate(category);
                      }}
                      aria-label={t("editCategory")}
                    >
                      <EditIcon className="size-4 text-primary hover:text-gray-700" />
                    </button>
                    <button
                      onClick={() => setOpenDelete(category.id)}
                      aria-label={t("deleteCategory")}
                    >
                      <DeleteIcon className="size-4 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </>
              }
              image={{
                alt: category.name,
                url: category.imageUrl,
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
          <DownloadButton<Category>
            fields={["id", locale === "ar" ? "nameAr" : "name", "createdAt"]}
            model="Category"
          />
        }
      />

      {/* Add/Edit Category Dialog */}
      <Dialog
        open={open}
        onOpenChange={() => {
          setCateUpdate(undefined);
          setOpen(false);
        }}
      >
        <DialogContent className="h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("categories")}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <PopupCategory
            parentName={parentName}
            setOpen={setOpen}
            category={cateUpdate}
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
                onClick={handleDeleteCate}
                className="bg-teal-500 hover:bg-teal-600 px-8 py-2 rounded-3xl text-white transition-colors w-28"
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

export default Categories;
