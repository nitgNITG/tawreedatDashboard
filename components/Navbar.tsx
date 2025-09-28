import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import useClickOutside from "../hooks/useClickOutSide";
import { deleteCookie } from "@/lib/deleteCookie";
import { useAppContext } from "@/context/appContext";
import { useAppSelector } from "@/hooks/redux";
import {
  GlobalIcon,
  BellIcon,
  DoubleGearIcon,
  LogoutIcon,
  MenuIcon,
} from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import SearchBar from "./Searchbar";
import axios from "axios";

const Navbar = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const { token, user } = useAppContext();

  const notifications = useAppSelector(
    (state) => state.notifications.unreadCount
  );

  const eleRef = useClickOutside(() => setIsAvatarOpen(false), isAvatarOpen);
  const logout = async () => {
    deleteCookie("token");
    router.push("/");
    setTimeout(() => window.location.reload(), 500);
  };

  const t = useTranslations("navbar");

  const handleLanguageChange = async (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
    await updateProfile(newLocale, token);
  };

  const updateProfile = async (newLocale: string, token: string) => {
    try {
      await axios.put(
        `/api/users/profile`,
        {
          lang: newLocale,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to update language preference:", error);
    }
  };

  const handleBellClick = () => {
    console.log("bell clicked");
    router.push(``);
  };

  // const showSearchBar =
  //   ["/en", "/ar"].includes(pathname) ||
  //   pathname.includes("/users/") ||
  //   pathname.includes("/ads/") ||
  //   pathname.includes("/brands/") ||
  //   pathname.includes("/products/") ||
  //   pathname.includes("/categories/") ||
  //   pathname.includes("/orders/") ||

  return (
    <nav className="p-container flex justify-between gap-5 lg:justify-end py-5 items-center">
      <button
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="lg:hidden"
      >
        <MenuIcon className="size-8" />
      </button>
      {/*       
      
      {!showSearchBar && <SearchBar />} */}
      
      <SearchBar />

      <div className="flex items-center gap-4">
        <div ref={eleRef} className="relative">
          <button
            onClick={() => {
              setIsAvatarOpen(!isAvatarOpen);
            }}
          >
            <Image
              src={"/imgs/avatar.png"}
              alt="Avatar"
              height={50}
              width={50}
              className="size-11 rounded-full"
            />
          </button>

          {isAvatarOpen && (
            <div
              className={clsx(
                "absolute w-72 bg-white shadow-lg z-[9999] rounded-lg end-0 "
              )}
            >
              <div className="flex items-center gap-2 p-4 border-b">
                <div>
                  <Image
                    src={"/imgs/avatar.png"}
                    alt="Avatar"
                    height={50}
                    width={50}
                    className="size-11 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h5 className="font-semibold text-sm">{user?.fullname}</h5>
                  <h5 className="font-semibold text-xs">{t("admin")}</h5>
                </div>
              </div>
              <div className="py-1">
                <Link href={`/${locale}/profile`} className="px-4 py-3 hover:bg-gray-100 w-full flex gap-1 duration-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {t("profile")}

                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-3 hover:bg-gray-100 w-full flex gap-1 duration-100"
                >
                  <LogoutIcon className="size-6" />
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </div>

        <Link
          href={`/${locale}/notifications`}
          onClick={handleBellClick}
          className="flex items-center p-1 rounded-full justify-center hover:opacity-80 transition-opacity text-primary bg-white relative"
        >
          <span className="absolute top-0 z-10 -right-1 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center px-1 py-0.5">
            {notifications}
          </span>
          <BellIcon className="size-5 text-primary" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center p-1 rounded-full justify-center hover:opacity-80 transition-opacity text-primary bg-white">
              <GlobalIcon className="size-5 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={locale === "ar" ? "start" : "end"}
            className="w-32"
          >
            <DropdownMenuItem
              onClick={() => handleLanguageChange("en")}
              disabled={locale === "en"}
              className={`cursor-pointer data-[disabled]:opacity-100 ${
                locale === "en" ? "bg-primary font-medium text-white" : ""
              }`}
            >
              {t("en")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLanguageChange("ar")}
              disabled={locale === "ar"}
              className={`cursor-pointer data-[disabled]:opacity-100 ${
                locale === "ar" ? "bg-primary font-medium text-white" : ""
              }`}
            >
              {t("ar")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href={`/${locale}/settings`}
          className="flex items-center p-1 rounded-full justify-center hover:opacity-80 transition-opacity text-primary bg-white relative"
        >
          <DoubleGearIcon className="size-5 text-primary" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
