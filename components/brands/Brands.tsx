"use client";
import { Brand } from "@/app/[locale]/brands/page";
import Table, { TableHeader } from "@/components/ui/Table";
import { useLocale, useTranslations } from "next-intl";
import {
  DeleteIcon,
  EditIcon,
  LoadingIcon,
  PlusCircleIcon,
  RestoreIcon,
} from "../icons";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import clsx from "clsx";
import ImageApi from "../ImageApi";
import { DateToText } from "@/lib/DateToText";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import DeleteDialog from "../DeleteDialog";
import AddOrEditBrand from "./AddOrEditBrand";

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
  const [totalBrands, setTotalBrands] = useState<number>(initTotalBrands);
  const [totalPages, setTotalPages] = useState<number>(initTotalPages);
  const [addOrEditBrand, setAddOrEditBrand] = useState<boolean>(false);
  const [updateBrand, setUpdateBrand] = useState<Brand | undefined>(undefined);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const headers: TableHeader[] = [
    { name: "image", className: "px-3 py-2" },
    {
      name: "name",
      className: "px-3 py-2",
      sortable: true,
      key: locale === "en" ? "name" : "nameAr",
    },
    {
      name: "createdAt",
      className: "px-3 py-2",
      sortable: true,
      key: "createdAt",
    },
    { name: "action", className: "px-3 py-2 flex justify-center" },
  ];

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
        prev.map((brand) => (brand.id === data.brand.id ? data.brand : brand))
      );
      toast.success(t("successRestore"));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? "There is an Error");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (permanent: boolean = false) => {
    if (!deleteBrand?.id) return;
    try {
      await axios.delete(
        `/api/brands/${deleteBrand.id}${permanent ? "?permanent=true" : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      setDeleteBrand(null);
      setBrands((prev) =>
        permanent
          ? prev.filter((brand) => brand.id !== deleteBrand.id)
          : prev.map((brand) =>
              brand.id === deleteBrand.id
                ? { ...deleteBrand, isDeleted: true }
                : brand
            )
      );

      const successMessage = permanent
        ? t("successDelete")
        : t("successArchive");
      toast.success(successMessage);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? "There is an Error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
            {t("brands")}
          </h4>
        </div>
        <Button
          onClick={() => setAddOrEditBrand(!addOrEditBrand)}
          className="px-5 py-2 flex gap-3 justify-center items-center bg-primary rounded-md text-white font-medium"
        >
          <PlusCircleIcon className="size-5" />
          {t("addBrand")}
        </Button>
      </div>
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
          <tr className="odd:bg-white even:bg-primary/5 border-b">
            <td
              colSpan={headers.length}
              scope="row"
              className="px-6 py-4 text-center font-bold"
            >
              {t("no data yet")}
            </td>
          </tr>
        )}
        {brands?.map((brand) => (
          <tr
            key={brand.id}
            className={clsx(
              "odd:bg-white even:bg-[#F0F2F5] border-b",
              brand.isDeleted && "!text-red-500 font-bold"
            )}
          >
            <td className="px-3 py-2">
              <div className="relative flex-center size-12">
                <ImageApi
                  key={brand.logoUrl}
                  src={brand.logoUrl ?? "/imgs/notfound.png"}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  quality={100}
                  className="object-cover rounded-lg"
                />
              </div>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {locale === "en" ? brand.name : brand.nameAr ?? brand.name}
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              {DateToText(brand.createdAt ?? "", locale)}
            </td>
            <td className="px-3 py-2">
              <div className="flex gap-2 justify-center items-center">
                {brand.isDeleted ? (
                  <Button
                    onClick={() => handelRestore(brand.id)}
                    className="flex gap-2 justify-center hover:text-gray-700 transition-colors"
                  >
                    {pending && <LoadingIcon className="size-5 animate-spin" />}
                    {!pending && (
                      <RestoreIcon className="size-5 !text-red-500 font-bold" />
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      size={"icon"}
                      variant="ghost"
                      onClick={() => {
                        setUpdateBrand(brand);
                        setAddOrEditBrand(true);
                      }}
                    >
                      <EditIcon className="size-5" />
                    </Button>
                    <Button
                      size={"icon"}
                      variant="ghost"
                      onClick={() => {
                        setDeleteBrand(brand);
                      }}
                    >
                      <DeleteIcon className="size-5" />
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <AddOrEditBrand
        key={updateBrand?.id}
        isOpen={addOrEditBrand}
        onClose={() => {
          setAddOrEditBrand(false);
          setUpdateBrand(undefined);
        }}
        brand={updateBrand}
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
    </div>
  );
};

export default Brands;
