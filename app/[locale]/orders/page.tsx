import { Suspense } from "react";
import LoadingTable from "@/components/ui/LoadingTable";
import OrdersData from "./OrdersData";
import { SearchParams } from "@/types/common";

const Orders = ({
  searchParams,
  params: { locale },
}: {
  searchParams: SearchParams;
  params: { locale: string };
}) => {
  const key = JSON.stringify(searchParams);
  return (
    <div className="p-container space-y-10">
      <Suspense key={key} fallback={<LoadingTable />}>
        <OrdersData locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Orders;
