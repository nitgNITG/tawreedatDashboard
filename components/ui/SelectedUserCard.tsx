"use client";
import React from "react";
import Image from "next/image";
import { User } from "@/lib/fetchUsers";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface SelectedUserCardProps {
  user: User;
  title?: string;
  className?: string;
}

const SelectedUserCard: React.FC<SelectedUserCardProps> = ({
  user,
  title,
  className = "",
}) => {
  const t = useTranslations("common");

  return (
    <div
      className={`bg-teal-50 border border-teal-200 rounded-lg p-4 ${className}`}
    >
      {title && (
        <p className="text-sm font-medium text-teal-800 mb-3">{title}</p>
      )}

      <div className="flex items-start gap-3">
        <Link href={`/users/${user.id}`} className="group">
          <Image
            alt={user.fullname}
            width={48}
            height={48}
            src={user.imageUrl ?? "/imgs/notfound.png"}
            className="size-12 rounded-full object-cover border-2 border-teal-200 transition duration-200 group-hover:border-teal-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              className="font-semibold truncate transition-colors duration-200 hover:text-teal-700 focus:text-teal-700"
              href={`/users/${user.id}`}
            >
              {user.fullname}
            </Link>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="font-medium">{t("email")}:</span>
              <span className="truncate">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">{t("phone")}:</span>
                <span dir="ltr">{user.phone}</span>
              </div>
            )}

            {!user.phone && (
              <div className="text-sm text-gray-400 italic">{t("noPhone")}</div>
            )}
            {user.Wallet && (
              <>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="font-medium">{t("walletAmount")}:</span>
                  <span>
                    {user.Wallet.buyerAmount.toFixed(2)} {t("currency")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="font-medium">{t("walletPoints")}:</span>
                  <span>{user.Wallet.point.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedUserCard;
