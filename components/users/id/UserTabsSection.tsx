"use client";
import SearchBar from "@/components/Searchbar";
import usePushQuery from "@/hooks/usePushQuery";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TabsSection = ({ children }: { children: React.ReactNode[] }) => {
  const t = useTranslations("user");
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState(params.get("tab") || "orders");
  const pushQuery = usePushQuery();

  const tabs = [
    { id: "orders", label: t("orders") },
    { id: "notifications", label: t("notifications") },
    { id: "reviews", label: t("reviews") },
  ];

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);

      if (hash && tabs.some((tab) => tab.id === hash)) {
        setActiveTab(hash);

        const timeoutId = setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);

    return () => {
      window.removeEventListener("hashchange", handleHash);
    };
  }, [tabs]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="bg-white text-[#59be8f] rounded-xl shadow-2xl">
          <div className="flex gap-2 py-2 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  history.replaceState(null, "", window.location.pathname);
                  if (tab.id !== "orders") pushQuery("tab", tab.id);
                }}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#02161e] text-white"
                    : "text-[#2ab09c] hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <SearchBar />
      </div>

      {/* Tab Content */}
      <div className="pt-4 min-h-svh">
        {activeTab === "orders" && children[0]}
        {activeTab === "notifications" && children[1]}
        {activeTab === "reviews" && children[2]}
      </div>
    </div>
  );
};

export default TabsSection;
