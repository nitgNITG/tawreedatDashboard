"use client";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Brand } from "@/app/[locale]/brands/page";
import { useAppContext } from "@/context/appContext";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import Table, { TableHeader } from "../ui/Table";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import {
  PlusCircleIcon,
  EditIcon,
  DeleteIcon,
  RestoreIcon,
  LoadingIcon,
} from "../icons";
import AddOrEditBrand from "./AddOrEditBrand";
import DeleteDialog from "../DeleteDialog";
import clsx from "clsx";
import ImageApi from "../ImageApi";
import { DateToText } from "@/lib/DateToText";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import SortableCard from "../ui/SortableCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface BrandsProps {
  brands: Brand[];
  totalBrands: number;
  totalPages: number;
}

const Brands = ({
  brands: initBrands,
  totalBrands: initTotalBrands,
  totalPages: initTotalPages,
}: BrandsProps) => {
  const locale = useLocale() as "en" | "ar";
  const { token } = useAppContext();
  const t = useTranslations("brands");

  const [brands, setBrands] = useState<Brand[]>(initBrands);
  const [totalBrands, setTotalBrands] = useState(initTotalBrands);
  const [totalPages, setTotalPages] = useState(initTotalPages);
  const [addOrEditBrand, setAddOrEditBrand] = useState(false);
  const [updateBrand, setUpdateBrand] = useState<Brand | undefined>(undefined);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [pending, setPending] = useState(false);
  const [initialOrder, setInitialOrder] = useState<number[]>([]);
  const [confirmSave, setConfirmSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const headers: TableHeader[] = [
    { name: "sortId", className: "!px-3 !py-2 flex justify-center" },
    { name: "image", className: "!px-3 !py-2" },
    {
      name: "name",
      className: "!px-3 !py-2",
      sortable: true,
      key: locale === "en" ? "name" : "nameAr",
    },
    {
      name: "createdAt",
      className: "!px-3 !py-2",
      sortable: true,
      key: "createdAt",
    },
    { name: "action", className: "!px-3 !py-2 flex justify-center" },
  ];

  useEffect(() => {
    setBrands(initBrands);
    setInitialOrder(initBrands.map((b) => b.id));
  }, [initBrands]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = brands.findIndex((b) => b.id === active.id);
    const newIndex = brands.findIndex((b) => b.id === over.id);

    const newOrder = arrayMove(brands, oldIndex, newIndex);
    const updatedBrands = newOrder.map((b, i) => ({ ...b, sortId: i + 1 }));
    setBrands(updatedBrands);

    const newOrderIds = updatedBrands.map((b) => b.id);
    setHasChanges(JSON.stringify(newOrderIds) !== JSON.stringify(initialOrder));
  }

  async function handleSaveOrder() {
    try {
      setLoading(true);
      const body = brands.map((b) => ({ id: b.id, sortId: b.sortId }));

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/brands/reorder`,
        { brands: body },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(t("orderSaved"));
      setInitialOrder(brands.map((b) => b.id));
      setHasChanges(false);
      setConfirmSave(false);
    } catch (err: any) {
      toast.error(err?.message || t("orderSaveFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleResetOrder() {
    setBrands(initBrands);
    setHasChanges(false);
  }

  const handleDelete = async (permanent = false) => {
    if (!deleteBrand?.id) return;
    try {
      await axios.delete(
        `/api/brands/${deleteBrand.id}${permanent ? "?permanent=true" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteBrand(null);
      setBrands((prev) =>
        permanent
          ? prev.filter((b) => b.id !== deleteBrand.id)
          : prev.map((b) =>
              b.id === deleteBrand.id ? { ...b, isDeleted: true } : b
            )
      );
      toast.success(permanent ? t("successDelete") : t("successArchive"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("error"));
    }
  };

  const handelRestore = async (id: number) => {
    try {
      setPending(true);
      const { data } = await axios.put(
        `/api/brands/${id}`,
        { isDeleted: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      setBrands((prev) =>
        prev.map((b) => (b.id === data.brand.id ? data.brand : b))
      );
      toast.success(t("successRestore"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
          {t("brands")}
        </h4>
        <Button
          onClick={() => setAddOrEditBrand(!addOrEditBrand)}
          className="px-5 py-2 flex gap-3 justify-center items-center bg-primary rounded-md text-white font-medium"
        >
          <PlusCircleIcon className="size-5" /> {t("addBrand")}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={brands.map((b) => b.id)}
          strategy={rectSortingStrategy}
        >
          <Table
            headers={headers}
            pagination={
              <Pagination
                count={totalBrands}
                totalPages={totalPages}
                downloadButton={
                  <DownloadButton<Brand>
                    model="brand"
                    fields={["name", "description", "createdAt"]}
                    items={["name", "description"]}
                  />
                }
              />
            }
          >
            {!brands.length && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-4 text-center font-bold"
                >
                  {t("no data yet")}
                </td>
              </tr>
            )}

            {brands.map((brand) => (
              <SortableCard
                mode="table"
                id={brand.id}
                key={brand.id}
                sortId={brand.sortId}
                className={clsx(
                  "odd:bg-white even:bg-[#F0F2F5] border-b",
                  brand.isDeleted && "!text-red-500 font-bold"
                )}
              >
                {/* <td className="px-3 py-2 cursor-grab font-bold">
                  {brand.sortId}
                </td> */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="relative w-12 h-12">
                    <ImageApi
                      src={brand.logoUrl ?? "/imgs/notfound.png"}
                      alt={brand.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  {locale === "en" ? brand.name : brand.nameAr ?? brand.name}
                </td>
                <td className="px-3 py-2">
                  {DateToText(brand.createdAt ?? "", locale)}
                </td>
                <td className="px-3 py-2 flex justify-center gap-2">
                  {brand.isDeleted ? (
                    <Button
                      onClick={() => handelRestore(brand.id)}
                      variant="ghost"
                    >
                      {pending ? (
                        <LoadingIcon className="size-5 animate-spin" />
                      ) : (
                        <RestoreIcon className="size-5 !text-red-500" />
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setUpdateBrand(brand);
                          setAddOrEditBrand(true);
                        }}
                        variant="ghost"
                      >
                        <EditIcon className="size-5" />
                      </Button>
                      <Button
                        onClick={() => setDeleteBrand(brand)}
                        variant="ghost"
                      >
                        <DeleteIcon className="size-5 text-red-500" />
                      </Button>
                    </>
                  )}
                </td>
              </SortableCard>
            ))}
          </Table>
        </SortableContext>
      </DndContext>

      {hasChanges && (
        <div className="fixed bottom-6 end-6 z-50 flex gap-3">
          <Button variant="outline" onClick={handleResetOrder}>
            {t("resetOrder")}
          </Button>
          <Button onClick={() => setConfirmSave(true)}>{t("saveOrder")}</Button>
        </div>
      )}

      <AddOrEditBrand
        isOpen={addOrEditBrand}
        brand={updateBrand}
        onClose={() => {
          setAddOrEditBrand(false);
          setUpdateBrand(undefined);
        }}
        setBrands={setBrands}
        setTotalBrands={setTotalBrands}
        setTotalPages={setTotalPages}
      />

      <DeleteDialog
        isOpen={!!deleteBrand}
        onClose={() => setDeleteBrand(null)}
        onDelete={handleDelete}
        titlePermanent={t("deleteBrand")}
        descriptionPermanent={t("deleteBrandMessage", {
          name:
            locale === "en"
              ? deleteBrand?.name
              : deleteBrand?.nameAr ?? deleteBrand?.name,
        })}
        title={t("archiveBrand")}
        description={t("archiveBrandMessage", {
          name:
            locale === "en"
              ? deleteBrand?.name
              : deleteBrand?.nameAr ?? deleteBrand?.name,
        })}
      />
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
    </div>
  );
};

export default Brands;
