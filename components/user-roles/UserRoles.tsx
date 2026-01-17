"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  DeleteIcon,
  EditIcon,
  PlusCircleIcon,
  RestoreIcon,
  LoadingIcon,
} from "../icons";
import { useLocale, useTranslations } from "next-intl";
import UserRolesPopupForm from "./UserRolesPopupForm";
import Table, { TableHeader } from "../ui/Table";
import Pagination from "../ui/Pagination";
import DownloadButton from "../ui/DownloadButton";
import DeleteUserRole from "./DeleteUserRole";
import { Link } from "@/i18n/routing";
import { User } from "lucide-react";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import { UserRole } from "@/types/userRole";

const UserRoles = ({
  totalPages,
  userRoles,
  count,
}: {
  totalPages: number;
  userRoles: UserRole[];
  count: number;
}) => {
  const t = useTranslations("userRoles");
  const locale = useLocale() as "en" | "ar";
  const { token } = useAppContext();

  // ✅ local state instead of redux
  const [roles, setRoles] = useState<UserRole[]>(userRoles ?? []);

  const [openForm, setOpenForm] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | undefined>(undefined);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteRole, setDeleteRole] = useState<UserRole | undefined>(undefined);

  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);

  useEffect(() => {
    setRoles(userRoles ?? []);
  }, [userRoles]);

  const headers: TableHeader[] = useMemo(
    () => [
      { name: "id", sortable: true, key: "created_at" },
      { name: "name", sortable: true, key: "name" },
      { name: "usersCount", sortable: true, key: "users._count" },
      { name: "action", className: "text-center" },
    ],
    [t],
  );

  const handleRestoreRole = async (id: string) => {
    try {
      setPendingRoleId(id);

      const { data } = await axios.put(
        `/api/roles/${id}`,
        { deleted_at: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        },
      );

      const updated = data.data;

      setRoles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      toast.success(t("toast.restoreSuccess"));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? t("toast.genericError"));
    } finally {
      setPendingRoleId(null);
    }
  };

  // ✅ used by DeleteUserRole dialog to update local state
  const handleSoftDeleteInState = (id: string, deletedAt: string | Date) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, deleted_at: String(deletedAt) } : r,
      ),
    );
  };

  return (
    <>
      <UserRolesPopupForm
        openForm={openForm}
        setOpenForm={setOpenForm}
        role={editRole}
        setRole={setEditRole}
        onSaved={(savedRole) => {
          setRoles((prev) => {
            const exists = prev.some((r) => r.id === savedRole.id);
            if (exists)
              return prev.map((r) => (r.id === savedRole.id ? savedRole : r));
            return [savedRole, ...prev];
          });
        }}
      />

      {deleteRole && (
        <DeleteUserRole
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          deleteRole={deleteRole}
          onDeleted={(id, deletedAt) => handleSoftDeleteInState(id, deletedAt)}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{t("title")}</h1>

        <button
          onClick={() => {
            setEditRole(undefined);
            setOpenForm(true);
          }}
          className="px-5 py-2 bg-primary rounded-md text-white font-medium"
        >
          <div className="flex gap-3">
            <PlusCircleIcon className="size-6" />
            <div className="flex-1">{t("addRole")}</div>
          </div>
        </button>
      </div>

      <div className="bg-white border rounded-xl">
        <Table
          headers={headers}
          pagination={
            <Pagination
              count={count}
              totalPages={totalPages}
              showDateRange={false}
              downloadButton={
                <DownloadButton<UserRole>
                  model="roles"
                  fields={["id", "name", "description"]}
                  sortCreatedAt={false}
                  items={["name", "description"]}
                />
              }
            />
          }
        >
          {!roles?.length && (
            <tr className="odd:bg-white even:bg-primary/5 border-b">
              <td
                colSpan={headers.length}
                scope="row"
                className="px-6 py-4 text-center font-bold"
              >
                {t("empty")}
              </td>
            </tr>
          )}

          {roles?.map((role: UserRole, index) => (
            <tr
              key={role.id}
              className={clsx(
                "odd:bg-white even:bg-[#F0F2F5] border-b",
                role.deleted_at && "!text-red-500 font-bold",
              )}
            >
              <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {role.userCount ?? 0}
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2 items-center justify-center">
                  {role.deleted_at ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreRole(role.id)}
                      className="flex gap-2 justify-center hover:text-gray-700 transition-colors"
                      disabled={pendingRoleId === role.id}
                      title={t("restore")}
                    >
                      {pendingRoleId === role.id ? (
                        <LoadingIcon className="size-4 animate-spin" />
                      ) : (
                        <RestoreIcon className="size-4 !text-red-500 font-bold" />
                      )}
                    </button>
                  ) : (
                    <>
                      <Link
                        href={`/users?role=${role.name}`}
                        className="text-primary hover:text-gray-700 transition-colors"
                        title={t("viewUsers")}
                      >
                        <User className="size-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEditRole(role);
                          setOpenForm(true);
                        }}
                        className="text-primary hover:text-gray-700 transition-colors"
                        title={t("edit")}
                      >
                        <EditIcon className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDelete(true);
                          setDeleteRole(role);
                        }}
                        className="text-primary hover:text-gray-700 transition-colors"
                        title={t("delete")}
                      >
                        <DeleteIcon className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  );
};

export default UserRoles;
