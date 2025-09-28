import React, { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import AdsData from "./AdsData";
import { SearchParams } from "@/types/common";

const page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const key = JSON.stringify(searchParams);

  return (
    <div className="p-container space-y-10 pb-5">
      <Suspense key={key} fallback={<LoadingTable />}>
        <AdsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default page;
