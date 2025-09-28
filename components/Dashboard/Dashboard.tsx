"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { DashboardProps } from "@/types/dashboard";
import { Link } from "@/i18n/routing";
import {
  CategoryIcon,
  GroupUsersIcon,
  ShoppingBag,
  BrandIcon,
  OnBoardingIcon,
  AdsIcon,
  FaqIcon,
  ArticlesIcon,
} from "../icons";
import { Card, CardContent, CardFooter } from "../ui/card";

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const t = useTranslations("dashboard");

  // Update the statCards array to use new icons
  const statCards = [
    {
      title: t("totalUsers"),
      value: data.totalUsers ?? 0,
      icon: <GroupUsersIcon className="w-12 h-8 text-gray-700" />,
      href: `/users`,
    },
    {
      title: t("totalProducts"),
      value: data.totalProducts ?? 0,
      icon: <BrandIcon className="w-12 h-8 text-gray-700" />,
      href: `/products`,
    },
    {
      title: t("totalCategories"),
      value: data.totalCategories ?? 0,
      icon: <CategoryIcon className="w-12 h-8 text-gray-700" />,
      href: `/categories`,
    },
    {
      title: t("totalBrands"),
      value: data.totalBrands ?? 0,
      icon: <BrandIcon className="w-12 h-8 text-gray-700" />,
      href: `/brands`,
    },
    {
      title: t("totalOrders"),
      value: data.totalOrders ?? 0,
      icon: <ShoppingBag className="w-12 h-8 text-gray-700" />,
      href: `/orders`,
    },
    {
      title: t("onBoarding"),
      value: data.totalOnBoarding ?? 0,
      icon: <OnBoardingIcon className="w-12 h-8 text-gray-700" />,
      href: `/on-boarding`,
    },
    {
      title: t("ads"),
      value: data.totalAds ?? 0,
      icon: <AdsIcon className="w-12 h-8 text-gray-700" />,
      href: `/ads`,
    },
    {
      title: t("faqs"),
      value: data.totalFaqs ?? 0,
      icon: <FaqIcon className="w-12 h-8 text-gray-700" />,
      href: `/faqs`,
    },
    {
      title: t("articles"),
      value: data.totalArticles ?? 0,
      icon: <ArticlesIcon className="w-12 h-8 text-gray-700" />,
      href: `/articles`,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">{t("dashboardTitle")}</h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 bg-white rounded-3xl shadow-sm p-5">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href} className="block">
            <Card className="bg-[#F0F2F5] rounded-3xl border-0 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col justify-between gap-4">
                {card.icon}
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-600">
                    {card.title}
                  </p>
                  <h3 className="font-medium text-gray-900">{card.value}</h3>
                </div>
              </CardContent>
              <CardFooter className="p-4 flex items-center border-t-2 border-primary text-primary font-bold justify-center">
                {t("viewAll")}
                <ArrowRight className="ml-1 size-5 font-bold" />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
