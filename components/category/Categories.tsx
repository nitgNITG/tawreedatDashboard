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
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import SortableCard from "../ui/SortableCard";
import { Button } from "../ui/button";

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
  const [initialOrder, setInitialOrder] = useState<number[]>([]);
  const [confirmSave, setConfirmSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { token } = useAppContext();
  const t = useTranslations("category");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    const newOrder = arrayMove(categories, oldIndex, newIndex);

    const updatedCategories = newOrder.map((cat, i) => ({
      ...cat,
      sortId: i + 1,
    }));
    dispatch(setCategories(updatedCategories));

    // Detect change from initial
    const newOrderIds = updatedCategories.map((c) => c.id);
    setHasChanges(JSON.stringify(newOrderIds) !== JSON.stringify(initialOrder));
  }

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
  async function handleSaveOrder() {
    try {
      setLoading(true);
      const body = categories.map((c) => ({
        id: c.id,
        sortId: c.sortId,
      }));

      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/reorder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categories: body }),
        }
      );

      toast.success("Order saved successfully!");

      // Reset change state
      setInitialOrder(categories.map((c) => c.sortId));
      setHasChanges(false);
      setConfirmSave(false);
    } catch (err) {
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  }
  function handleResetOrder() {
    dispatch(setCategories(initCategories));
    setHasChanges(false);
  }

  useEffect(() => {
    dispatch(setCategories(initCategories));

    // Save initial order
    setInitialOrder(initCategories.map((c) => c.id));
  }, [initCategories, dispatch]);

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
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            <PlusCircleIcon className="size-6" />
            <span className="flex-1">{t("addCategory")}</span>
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center font-bold py-8">{t("no_data_yet")}</div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
          modifiers={[restrictToParentElement]}
        >
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-8 bg-white rounded-3xl px-5 py-8">
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={rectSortingStrategy}
            >
              {categories.map((category, index) => (
                <SortableCard key={category.id} id={category.id}>
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
                              {category._count?.children || 0}{" "}
                              {t("subCategories")}
                            </span>
                            <span>
                              {category._count?.brands || 0} {t("brands")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 justify-center items-center">
                          <Button
                            asChild={true}
                            variant={"ghost"}
                            className="!p-1 !h-auto"
                          >
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
                          </Button>
                          <Button
                            onClick={() => {
                              setOpen(true);
                              setCateUpdate(category);
                            }}
                            aria-label={t("editCategory")}
                            variant={"ghost"}
                            className="!p-1 !h-auto"
                          >
                            <EditIcon className="size-4 text-primary hover:text-gray-700" />
                          </Button>
                          <Button
                            onClick={() => setOpenDelete(category.id)}
                            aria-label={t("deleteCategory")}
                            variant={"ghost"}
                            className="!p-1 !h-auto"
                          >
                            <DeleteIcon className="size-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </div>
                      </>
                    }
                    image={{
                      alt: category.name,
                      url: category.imageUrl,
                    }}
                  />
                </SortableCard>
              ))}
            </SortableContext>
          </div>
        </DndContext>
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

      {hasChanges && (
        <div className="fixed bottom-6 end-6 z-50 flex gap-3">
          <Button variant="outline" onClick={handleResetOrder}>
            {t("resetOrder") ?? "Reset Order"}
          </Button>

          <Button onClick={() => setConfirmSave(true)}>
            {t("saveOrder") ?? "Save Order"}
          </Button>
        </div>
      )}

      <Dialog open={confirmSave} onOpenChange={setConfirmSave}>
        <DialogContent className="bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>{t("confirmOrderUpdateTitle")}</DialogTitle>
            <DialogDescription>{t("confirmOrderUpdateDesc")}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-4 pt-4">
            <Button onClick={() => setConfirmSave(false)} variant="outline">
              {t("cancel")}
            </Button>

            <Button disabled={loading} onClick={handleSaveOrder}>
              {loading ? (
                <LoadingIcon className="size-5 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <Button onClick={handleDeleteCate}>
                {loading ? (
                  <LoadingIcon className="size-5 animate-spin" />
                ) : (
                  t("yes")
                )}
              </Button>
              <Button onClick={() => setOpenDelete(null)} variant="outline">
                {t("no")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
