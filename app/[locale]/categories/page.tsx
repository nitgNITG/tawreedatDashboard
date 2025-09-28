import React, { Suspense } from "react";
import CategoriesData from "./categoriesData";
import LoadingTable from "@/components/ui/LoadingTable";
import { SearchParams } from "@/types/common";

const page = ({
  searchParams,
  params: { locale },
}: {
  searchParams: SearchParams;
  params: { locale: string };
}) => {
  const key = JSON.stringify(searchParams);
  return (
    <div className="p-container">
      <Suspense key={key} fallback={<LoadingTable />}>
        <CategoriesData locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default page;
