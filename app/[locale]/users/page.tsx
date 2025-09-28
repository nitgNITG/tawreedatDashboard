import { Suspense } from "react";
import UsersData from "./UsersData";
import LoadingTable from "@/components/ui/LoadingTable";
import DeleteUsers from "@/components/users/DeleteUsers";
import { SearchParams } from "@/types/common";

const Users = ({ searchParams }: { searchParams: SearchParams }) => {
  const key = JSON.stringify(searchParams);
  return (
    <div className="p-container space-y-10">
      <Suspense key={key} fallback={<LoadingTable />}>
        <UsersData searchParams={searchParams} />
      </Suspense>
      <DeleteUsers />
    </div>
  );
};

export default Users;
