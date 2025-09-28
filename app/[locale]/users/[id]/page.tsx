import { Suspense } from "react";
import UserData from "./UserData";
import LoadingTable from "@/components/ui/LoadingTable";
import TabsSection from "@/components/users/id/UserTabsSection";
import UserOrdersData from "./UserOrdersData";
import UserNotificationsData from "./UserNotificationsData";
import { SearchParams } from "@/types/common";

const Page = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) => {
  const key = JSON.stringify({ searchParams });
  return (
    <div className="p-container space-y-10 pb-4">
      <Suspense fallback={<LoadingTable />}>
        <UserData params={params} />
      </Suspense>
      <TabsSection>
        <Suspense key={key} fallback={<LoadingTable />}>
          <UserOrdersData searchParams={searchParams} params={params} />
        </Suspense>
        <Suspense key={key} fallback={<LoadingTable />}>
          <UserNotificationsData searchParams={searchParams} params={params} />
        </Suspense>
      </TabsSection>
    </div>
  );
};

export default Page;
