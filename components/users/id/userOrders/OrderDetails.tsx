"use client";
import { Order } from "@/app/[locale]/orders/OrdersData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

const OrderDetails = ({
  open,
  setOpen,
  order,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: Order;
}) => {
  const t = useTranslations("orders");
  const locale = useLocale();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-3xl bg-[#f0f2f5] p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center pt-6 pb-2">
            {t("orderDetails")}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="rounded-xl overflow-x-auto sidebar-scrolling px-4 pb-6">
          <table className="w-full text-base text-center text-gray-700 bg-white rounded-2xl overflow-hidden shadow">
            <thead className="text-base font-bold bg-[#dfe2e8]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">{t("image")}</th>
                <th className="px-4 py-3 whitespace-nowrap">{t("name")}</th>
                <th className="px-4 py-3 whitespace-nowrap">{t("cost")}</th>
                <th className="px-4 py-3 whitespace-nowrap">
                  {t("afterOffered")}
                </th>
                <th className="px-4 py-3 whitespace-nowrap">{t("quantity")}</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {order.items?.map((item, idx) => {
                const stringifyImages = `${item?.product?.images ?? ""}`;
                const parseImages = item?.product?.images
                  ? JSON.parse(stringifyImages)
                  : [];

                return (
                  <tr
                    key={item?.id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#f9f6ff]"}
                  >
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center">
                        <Image
                          src={parseImages?.[0] || "/imgs/notfound.png"}
                          alt={item?.product?.name || "-"}
                          width={48}
                          height={48}
                          className="rounded-full object-cover w-16 h-16 border border-gray-200"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {locale === "ar"
                        ? item?.product?.nameAr ?? item?.product?.name
                        : item?.product?.name || "-"}
                    </td>
                    <td className="px-4 py-3">{item?.price ?? "-"}</td>
                    <td className="px-4 py-3">
                      {item?.product?.offer ?? item?.product?.price ?? "-"}
                    </td>
                    <td className="px-4 py-3">{item.quantity ?? 1}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#f0f2f5]">
                <td
                  colSpan={4}
                  className="text-right px-4 py-4 font-bold text-xl"
                >
                  {t("total")}
                </td>
                <td className="px-4 py-4 font-bold text-2xl text-black">
                  {order.totalAmount ?? 0}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
