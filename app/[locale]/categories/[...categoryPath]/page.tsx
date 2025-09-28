import React, { Suspense } from "react";
import CategoriesData from "../categoriesData";
import LoadingTable from "@/components/ui/LoadingTable";
import ProductsData from "../../products/productsData";
import { SearchParams } from "@/types/common";

const page = async ({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: {
    categoryPath: string[];
    locale: string;
  };
}) => {
  // Convert the category path array to readable names
  const categoryPath = params.categoryPath.map((segment) =>
    decodeURIComponent(segment.replace(/-/g, " "))
  );

  const currentCategory = categoryPath[categoryPath.length - 1];

  // Separate archive-related params
  const archiveParams = (({ skipArchive, keywordArchive, limitArchive }) => ({
    skipArchive,
    keywordArchive,
    limitArchive,
  }))(searchParams);

  // Remove archive params for categories
  const { skipArchive, keywordArchive, limitArchive, ...normalParams } =
    searchParams;

  // Keys for Suspense - include the full path for proper caching
  const categoriesKey = `categories-${JSON.stringify({
    ...normalParams,
    path: categoryPath,
  })}`;
  const productsKey = `products-${JSON.stringify({
    ...archiveParams,
    category: currentCategory,
  })}`;

  return (
    <div className="p-container space-y-4">
      <Suspense key={categoriesKey} fallback={<LoadingTable />}>
        <CategoriesData
          parentName={currentCategory}
          categoryPath={categoryPath}
          locale={params.locale}
          searchParams={searchParams}
        />
      </Suspense>
      <Suspense key={productsKey} fallback={<LoadingTable />}>
        <ProductsData
          categoryName={currentCategory}
          locale={params.locale}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
};

export default page;
