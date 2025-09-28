"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import ProfileInfoSection from "./ProfileInfoSection";
import PasswordChangeSection from "./PasswordChangeSection";
import EmailChangeSection from "./EmailChangeSection";

const ProfileForm = () => {
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] = useState<"general" | "email" | "password">(
    "general"
  );

  const tabs = [
    { id: "general", label: t("generalInfo") },
    { id: "email", label: t("changeEmail") },
    { id: "password", label: t("changePassword") },
  ];

  return (
    <div className="space-y-6">
      {/* Custom Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>{" "}
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "general" && <ProfileInfoSection />}

        {activeTab === "email" && <EmailChangeSection />}

        {activeTab === "password" && <PasswordChangeSection />}
      </div>
    </div>
  );
};

export default ProfileForm;
