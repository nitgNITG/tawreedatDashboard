"use client";
import { useAppContext } from "@/context/appContext";
import useClickOutside from "@/hooks/useClickOutSide";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import {
  AboutAppIcon,
  AdsIcon,
  ArticlesIcon,
  BrandIcon,
  CategoryIcon,
  DashboardIcon,
  DoubleGearIcon,
  FaqIcon,
  OnBoardingIcon,
  ShoppingBag,
  ShoppingCart,
  TranslateIcon,
  UserIcon,
  UsersIcon,
} from "./icons";
import { UserCog } from "lucide-react";

const Sidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { user } = useAppContext();
  const items = [
    {
      label: t("dashboard"),
      icon: <DashboardIcon className="size-6" />,
      href: "/",
      role: "admin",
    },
    {
      href: "/users",
      label: t("users"),
      icon: <UsersIcon className="size-6" />,
      role: "admin",
    },
    {
      href: "/user-roles",
      label: t("userRoles"),
      icon: <UserCog className="size-6" />,
      role: "admin",
    },
    {
      label: t("brands"),
      icon: <BrandIcon className="size-6" />,
      href: "/brands",
      role: "admin",
    },
    {
      label: t("categories"),
      icon: <CategoryIcon className="size-6" />,
      href: "/categories",
      role: "admin",
    },
    {
      label: t("products"),
      icon: <ShoppingCart className="size-6" />,
      href: "/products",
      role: "admin",
    },
    {
      label: t("orders"),
      icon: <ShoppingBag className="size-6" />,
      href: "/orders",
      role: "admin",
    },
    {
      label: t("ads"),
      icon: <AdsIcon className="size-6" />,
      href: "/ads",
      role: "admin",
    },
    {
      label: t("articles"),
      icon: <ArticlesIcon className="size-6" />,
      href: "/articles",
      role: "admin",
    },
    {
      label: t("faqs"),
      icon: <FaqIcon className="size-6" />,
      href: "/faqs",
      role: "admin",
    },
    {
      label: t("contacts"),
      icon: <UsersIcon className="size-6" />,
      href: "/contacts",
      role: "admin",
    },
    {
      label: t("aboutApp"),
      icon: <AboutAppIcon className="size-6" />,
      href: "/about-app",
      role: "admin",
    },
    {
      label: t("translateApp"),
      icon: <TranslateIcon className="size-6" />,
      href: "/translate-app",
      role: "admin",
    },
    {
      label: t("onBoarding"),
      icon: <OnBoardingIcon className="size-6" />,
      href: "/on-boarding",
      role: "admin",
    },
    {
      label: t("profile"),
      icon: <UserIcon className="size-6" />,
      href: "/profile",
      role: "all",
    },
    {
      label: t("settings"),
      icon: <DoubleGearIcon className="size-6" />,
      href: "/settings",
      role: "admin",
    },
  ];

  const eleRef = useClickOutside(() => {
    setOpen(false);
  }, open);

  return (
    <div className="lg:w-72 flex-shrink-0">
      <div
        ref={eleRef}
        className={clsx(
          "w-64 lg:w-72 bg-[#241234] h-lvh fixed top-0 z-[1000] flex flex-col",
          open && (locale === "en" ? "rtl" : "ar-ltr"),
          !open && (locale === "en" ? "ltr" : "ar-rtl"),
        )}
      >
        {/* Logo Section */}
        <div className="p-6">
          <Link href={`/`}>
            <Image
              src={"/imgs/logo.svg"}
              className="h-16 w-auto object-contain mx-auto"
              alt="dashboard logo"
              width={300}
              height={400}
              priority
            />
          </Link>
        </div>

        {/* ADMIN Label */}
        <div className="relative flex items-center px-4 py-2 before:absolute before:top-50 before:left-0 before:w-full before:h-[1px] before:bg-white before:z-[-1]">
          <div className="text-white text-sm bg-[#241234] px-2">
            {t("adminInteraction")}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-2 overflow-y-auto px-2 sidebar-scrolling">
          {" "}
          {items
            .filter((item) => item.role === "all" || user.role === "admin")
            .map((item) => (
              <div key={item.label}>
                <Link
                  onClick={() => setOpen(false)}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors duration-200",
                    {
                      "bg-white text-black border-primary border-2 rounded-2xl ":
                        item.href == "/"
                          ? pathname == `/${locale}`
                          : pathname.includes(item.href),
                      "text-white hover:bg-primary": !(item.href == "/"
                        ? pathname == `/${locale}`
                        : pathname.includes(item.href)),
                    },
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium ">{item.label}</span>
                </Link>
              </div>
            ))}
        </div>

        {/* Bottom Logo */}
        <div className="mt-auto border-t border-primary">
          <a
            href={`https://nitg-eg.com/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative"
          >
            <Image
              src={"/imgs/NITG-logo.svg"}
              alt="NITG logo"
              width={60}
              height={60}
              className="size-full object-contain bottom-full"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
