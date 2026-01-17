"use client";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon, LoadingIcon, PlusCircleIcon } from "../icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import AddProduct from "./AddProduct";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { deleteProduct, setProducts } from "@/redux/reducers/productsReducer";

import { Product } from "@/app/[locale]/products/productsData";
import SortDropdown from "../SortDropdown";
import CardGridItem from "../ui/CardGridItem";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import FilterDropdown, { FilterOption } from "../FilterDropdown";
import { Star } from "lucide-react";
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
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import SortableCard from "../ui/SortableCard";
import { Button } from "../ui/button";

const Products = ({
  products: initProducts,
  count,
  totalPages,
  categoryName,
}: {
  products: Product[];
  count: number;
  totalPages: number;
  categoryName?: string;
}) => {
  const t = useTranslations("products");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState<number | null>(null);
  const [proUpdate, setProUpdate] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [initialOrder, setInitialOrder] = useState<number[]>([]);
  const [confirmSave, setConfirmSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    dispatch(setProducts(initProducts));
    setInitialOrder(initProducts.map((c) => c.id));
  }, [initProducts]);

  const products: Product[] = useAppSelector((s) => s.products.products);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/products/${openDelete}}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteProduct(openDelete));
      setOpenDelete(null);
      toast.success(t("successDelete"));
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    } finally {
      setLoading(false);
    }
  };

  const filterOptions: FilterOption[] = [
    {
      label: t("activeProducts"),
      value: "true",
      queryParam: categoryName ? "isActiveArchive" : "isActive",
    },
    {
      label: t("inactiveProducts"),
      value: "false",
      queryParam: categoryName ? "isActiveArchive" : "isActive",
    },
    {
      label: t("featuredProducts"),
      value: "true",
      queryParam: categoryName ? "isFeaturedArchive" : "isFeatured",
    },
  ];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((c) => c.id === active.id);
    const newIndex = products.findIndex((c) => c.id === over.id);

    const newOrder = arrayMove(products, oldIndex, newIndex);

    const updatedProducts = newOrder.map((prod, i) => ({
      ...prod,
      sortId: i + 1,
    }));
    dispatch(setProducts(updatedProducts));
    // Detect change from initial
    const newOrderIds = updatedProducts.map((c) => c.id);
    setHasChanges(JSON.stringify(newOrderIds) !== JSON.stringify(initialOrder));
  }
  async function handleSaveOrder() {
    try {
      setLoading(true);
      const body = products.map((c) => ({
        id: c.id,
        sortId: c.sortId,
      }));

      await axios.post(
        "/api/products/reorder",
        {
          products: body,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Order saved successfully!");

      // Reset change state
      setInitialOrder(products.map((c) => c.id));
      setHasChanges(false);
      setConfirmSave(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  }
  function handleResetOrder() {
    dispatch(setProducts(initProducts));
    setHasChanges(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
          {t("products")}
        </h4>
        <div className="flex gap-2 items-center">
          <FilterDropdown options={filterOptions} placeholder="filter" />
          <SortDropdown
            archive={!!categoryName}
            options={[
              { label: t("sortId"), value: "sortId" },
              { label: t("name"), value: locale === "ar" ? "nameAr" : "name" },
              { label: t("createdAt"), value: "createdAt" },
              { label: t("price"), value: "price" },
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
              <div className="flex-1">{t("addProduct")}</div>
            </div>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center font-bold py-8">{t("no_data_yet")}</div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          modifiers={[restrictToParentElement]}
        >
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-8 bg-white rounded-3xl px-5 py-8">
            <SortableContext
              items={products.map((c) => c.id)}
              strategy={rectSortingStrategy}
            >
              {products.map((product, index) => (
                <SortableCard key={product.id} id={product.id}>
                  <CardGridItem
                    key={product.id}
                    isPriority={index < 6}
                    cardContent={
                      <>
                        <div className="flex flex-col items-start w-9/12">
                          <div className="text-sm font-bold truncate w-full">
                            {locale === "ar" ? product.nameAr : product.name}
                          </div>
                          <div className="text-[0.7rem] truncate max-w-[100px] text-gray-500 flex gap-2 items-center justify-center">
                            {locale === "ar"
                              ? product.descriptionAr
                              : product.description}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {product.stock} {t("inStock")}
                        </span>
                      </>
                    }
                    cardFooter={
                      <div className="flex flex-col gap-1 size-full">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="size-4" />
                          <span className="text-sm font-medium flex items-center">
                            {product.rating.toFixed(1)} ({product.totalReviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            {product.price} {t("egp")}
                          </span>
                          <div className="flex gap-2 justify-center items-center">
                            <button
                              onClick={() => {
                                setOpen(true);
                                setProUpdate(product);
                              }}
                              aria-label={t("editProduct")}
                            >
                              <EditIcon className="size-4 text-primary hover:text-gray-700" />
                            </button>
                            <button
                              onClick={() => setOpenDelete(product.id)}
                              aria-label={t("deleteProduct")}
                            >
                              <DeleteIcon className="size-4 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                    image={{
                      alt: product.name,
                      url: product.images?.[0] ?? "/imgs/notfound.png",
                    }}
                  />
                </SortableCard>
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      <Pagination
        archive
        count={count}
        totalPages={totalPages}
        bgColor
        className="bg-transparent px-0"
        downloadButton={
          <DownloadButton<Product>
            fields={[
              "id",
              locale === "ar" ? "nameAr" : "name",
              "price",
              "stock",
              "createdAt",
            ]}
            model="Product"
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
      {/* Confirm Save Order Dialog */}
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

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={open}
        onOpenChange={() => {
          setProUpdate(undefined);
          setOpen(false);
        }}
      >
        <DialogContent className="h-[80vh] w-full md:w-[700px]">
          <DialogHeader>
            <DialogTitle>{t("products")}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <AddProduct
            categoryName={categoryName}
            setOpen={setOpen}
            product={proUpdate}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!openDelete} onOpenChange={() => setOpenDelete(null)}>
        <DialogContent className="bg-white p-0 rounded-lg">
          <div className="p-6 space-y-6">
            <DialogHeader className="space-y-4 text-center">
              <DialogTitle className="text-xl font-bold text-black">
                {t("deleteProduct")}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-base">
                {t("deleteConfirmDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-4 p-4">
              <button
                onClick={handleDelete}
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

export default Products;
