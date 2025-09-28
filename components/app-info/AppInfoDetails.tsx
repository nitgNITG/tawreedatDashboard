"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import InfoSection from "./InfoSection";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";

interface AppData {
  about: string;
  aboutAr: string;
  mission: string;
  missionAr: string;
  vision: string;
  visionAr: string;
  privacy_policy: string;
  privacy_policyAr: string;
  terms: string;
  termsAr: string;
  digitalCard: string;
  digitalCardAr: string;
}

const AppInfoDetails = ({ data }: { data: AppData }) => {
  const t = useTranslations("appInfo");
  const { token } = useAppContext();
  const [isAppInfoExpanded, setIsAppInfoExpanded] = useState(true);
  const [isArabicExpanded, setIsArabicExpanded] = useState(false);
  const [appData, setAppData] = useState<AppData>(data);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  const handleContentChange = (field: keyof AppData, value: string) => {
    if (!appData) return;
    setAppData((prev) => ({ ...prev, [field]: value }));
    setEditedFields((prev) => new Set(prev).add(field));
  };

  const updateField = async (field: keyof AppData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/app-data`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [field]: appData?.[field] || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update content");

      toast.success(`Updated ${field} successfully`);
      setEditedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to update ${field}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* English Section */}
      <div className="bg-white rounded-[32px] shadow-lg overflow-hidden">
        {/* English Header */}
        <button
          onClick={() => setIsAppInfoExpanded(!isAppInfoExpanded)}
          className={cn(
            "w-full px-6 py-4 flex items-center justify-between",
            "bg-[#241234] transition-colors duration-200"
          )}
        >
          <h2 className="text-lg font-semibold text-white">
            App info, English
          </h2>
          <ChevronDown
            className={cn(
              // "size-5 text-primary transition-transform duration-200",
              // isAppInfoExpanded && "transform rotate-180"
              "size-5 text-primary transition-all duration-200",
              "hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.5)] hover:text-primary-400",
              "filter hover:brightness-125",
              isAppInfoExpanded ? "transform rotate-180" : ""
            )}
          />
        </button>

        {/* English Content */}
        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            isAppInfoExpanded
              ? "max-h-[5000px] opacity-100 p-6"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-2">
            <InfoSection
              title={t("aboutUsEn")}
              content={appData?.about || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("about", value)}
              onSave={() => updateField("about")}
              isEdited={editedFields.has("about")}
            />
            <InfoSection
              title={t("missionEn")}
              content={appData?.mission || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("mission", value)}
              onSave={() => updateField("mission")}
              isEdited={editedFields.has("mission")}
            />
            <InfoSection
              title={t("visionEn")}
              content={appData?.vision || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("vision", value)}
              onSave={() => updateField("vision")}
              isEdited={editedFields.has("vision")}
            />
            <InfoSection
              title={t("privacyPolicyEn")}
              content={appData?.privacy_policy || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("privacy_policy", value)}
              onSave={() => updateField("privacy_policy")}
              isEdited={editedFields.has("privacy_policy")}
            />
            <InfoSection
              title={t("termsEn")}
              content={appData?.terms || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("terms", value)}
              onSave={() => updateField("terms")}
              isEdited={editedFields.has("terms")}
            />
            <InfoSection
              title={t("digitalCardEn")}
              content={appData?.digitalCard || ""}
              direction="ltr"
              onEdit={(value) => handleContentChange("digitalCard", value)}
              onSave={() => updateField("digitalCard")}
              isEdited={editedFields.has("digitalCard")}
            />
          </div>
        </div>
      </div>

      {/* Arabic Section */}
      <div className="bg-white rounded-[32px] shadow-lg overflow-hidden mt-6">
        {/* Arabic Header */}
        <button
          onClick={() => setIsArabicExpanded(!isArabicExpanded)}
          className={cn(
            "w-full px-6 py-4 flex items-center justify-between",
            "bg-[#241234] transition-colors duration-200"
          )}
        >
          <h2 className="text-lg font-semibold text-white">App info, Arabic</h2>
          <ChevronDown
            className={cn(
              "size-5 text-primary transition-all duration-200",
              "hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.5)] hover:text-primary-400",
              "filter hover:brightness-125",
              isArabicExpanded ? "transform rotate-180" : ""
            )}
          />
        </button>

        {/* Arabic Content */}
        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            isArabicExpanded
              ? "max-h-[5000px] opacity-100 p-6"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-2">
            <InfoSection
              title={t("aboutUsAr")}
              content={appData.aboutAr}
              direction="rtl"
              onEdit={(value) => handleContentChange("aboutAr", value)}
              onSave={() => updateField("aboutAr")}
              isEdited={editedFields.has("aboutAr")}
            />
            <InfoSection
              title={t("missionAr")}
              content={appData.missionAr}
              direction="rtl"
              onEdit={(value) => handleContentChange("missionAr", value)}
              onSave={() => updateField("missionAr")}
              isEdited={editedFields.has("missionAr")}
            />
            {appData.visionAr && (
              <InfoSection
                title={t("visionAr")}
                content={appData.visionAr}
                direction="rtl"
                onEdit={(value) => handleContentChange("visionAr", value)}
                onSave={() => updateField("visionAr")}
                isEdited={editedFields.has("visionAr")}
              />
            )}
            <InfoSection
              title={t("visionAr")}
              content={appData.privacy_policyAr}
              direction="rtl"
              onEdit={(value) => handleContentChange("privacy_policyAr", value)}
              onSave={() => updateField("privacy_policyAr")}
              isEdited={editedFields.has("privacy_policyAr")}
            />
            <InfoSection
              title={t("termsAr")}
              content={appData.termsAr}
              direction="rtl"
              onEdit={(value) => handleContentChange("termsAr", value)}
              onSave={() => updateField("termsAr")}
              isEdited={editedFields.has("termsAr")}
            />
            <InfoSection
              title={t("digitalCardAr")}
              content={appData.digitalCardAr}
              direction="rtl"
              onEdit={(value) => handleContentChange("digitalCardAr", value)}
              onSave={() => updateField("digitalCardAr")}
              isEdited={editedFields.has("digitalCardAr")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInfoDetails;
