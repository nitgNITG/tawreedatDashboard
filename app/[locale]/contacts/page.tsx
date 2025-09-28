import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import ContactData from "./ContactData";
import { SearchParams } from "@/types/common";

const page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const key = JSON.stringify(searchParams);

  return (
    <div className="p-container space-y-10">
      <Suspense key={key} fallback={<LoadingTable />}>
        <ContactData searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default page;
