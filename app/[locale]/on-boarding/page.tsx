import OnBoardingHeader from "@/components/onBoarding/OnBoardingHeader";
import { fetchData } from "@/lib/fetchData";
import { getLocale } from "next-intl/server";
import React from "react";

const page = async () => {
  const locale = await getLocale();
  const { data, error, loading } = await fetchData("/api/on-boarding", {
    cache: "no-store",
    headers: {
      "accept-language": locale,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-container space-y-10 pb-5">
      <OnBoardingHeader data={data} />
    </div>
  );
};

export default page;
