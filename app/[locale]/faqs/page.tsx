import FAQsDetails from "@/components/faqs/FAQsDetails";
import FAQTitle from "@/components/faqs/FAQTitle";
import { fetchData } from "@/lib/fetchData";
import { getLocale } from "next-intl/server";
import React from "react";

const page = async () => {
  const locale = await getLocale();
  const { data, error, loading } = await fetchData("/api/faqs", {
    cache: "no-store",
    headers: {
      "Accept-Language": locale,
    },
  });
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  return (
    <div className="p-container space-y-10">
      <div className="space-y-5 lg:space-y-10">
        <FAQTitle />
        <div>
          <FAQsDetails faqs={data.faqs} />
        </div>
      </div>
    </div>
  );
};

export default page;
