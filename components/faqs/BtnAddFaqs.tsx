"use client";
import React, { useState } from "react";
import { PlusCircleIcon } from "../icons";
import { useTranslations } from "next-intl";
import AddFAQs from "./AddFAQs";

const BtnAddFaqs = () => {
  const t = useTranslations("faqs");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => {
          setOpen(true);
          document.body.style.overflowY = "hidden";
        }}
        className="px-5 py-2 bg-primary rounded-md text-white font-medium"
      >
        <div className="flex gap-3">
          <PlusCircleIcon className="size-6" />
          <div className="flex-1">{t("addFAQ")}</div>
        </div>
      </button>
      {open && <AddFAQs setOpen={setOpen} />}
    </div>
  );
};

export default BtnAddFaqs;
