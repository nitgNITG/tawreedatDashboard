import { Suspense } from "react";
import UserData from "./UserData";
import LoadingTable from "@/components/ui/LoadingTable";
import TabsSection from "@/components/users/id/UserTabsSection";
import UserOrdersData from "./UserOrdersData";
import UserNotificationsData from "./UserNotificationsData";
import { SearchParams } from "@/types/common";
import UserReviewsData from "./UserReviewsData";

const Page = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) => {
  const tab: "orders" | "notifications" | "reviews" =
  (searchParams.tab?.toString() as "orders" | "notifications" | "reviews") ||
  "orders";
  const key = JSON.stringify({ searchParams, tab });
  return (
    <div className="p-container space-y-10 pb-4">
      <Suspense fallback={<LoadingTable />}>
        <UserData params={params} />
      </Suspense>
      <TabsSection>
        {tab === "orders" && (
          <Suspense key={tab === "orders" ? key : undefined} fallback={<LoadingTable />}>
            <UserOrdersData searchParams={searchParams} params={params} />
          </Suspense>
        )}
        {tab === "notifications" && (
          <Suspense key={tab === "notifications" ? key : undefined} fallback={<LoadingTable />}>
            <UserNotificationsData
              searchParams={searchParams}
              params={params}
            />
          </Suspense>
        )}
        {tab === "reviews" && (
          <Suspense key={tab === "reviews" ? key : undefined} fallback={<LoadingTable />}>
            <UserReviewsData searchParams={searchParams} params={params} />
          </Suspense>
        )}
      </TabsSection>
    </div>
  );
};

export default Page;
