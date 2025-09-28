import React from "react";
import BtnAddFaqs from "./BtnAddFaqs";
import { useTranslations } from "next-intl";

const FAQTitle = () => {
  const t = useTranslations("faqs");

  return (
    <div className="flex justify-between items-center">
      <h4 className="font-bold text-lg md:text-xl lg:text-2xl">{t("title")}</h4>
      <BtnAddFaqs />
    </div>
  );
};

export default FAQTitle;
