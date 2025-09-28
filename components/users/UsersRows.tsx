"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ImageApi from "../ImageApi";
import {
  DeleteIcon,
  LoadingIcon,
  PlusCircleIcon,
  RestoreIcon,
  EditIcon,
} from "@/components/icons";
import {
  setUsers,
  updateUser,
  User,
  setUsersCount,
} from "@/redux/reducers/usersReducer";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useAppContext } from "@/context/appContext";
import AddUserForm from "./AddUserForm";
import axios from "axios";
import Table, { TableHeader } from "@/components/ui/Table";
import clsx from "clsx";
import Pagination from "../ui/Pagination";
import { DateToText } from "@/lib/DateToText";
import DownloadButton from "../ui/DownloadButton";
import { Link } from "@/i18n/routing";
import DeleteUser from "./id/DeleteUser";

const UsersRows = ({
  users,
  count,
  totalPages,
}: {
  users: User[];
  count: number;
  totalPages: number;
}) => {
  const t = useTranslations("user");
  const locale = useLocale() as "en" | "ar";
  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const [addUser, setAddUser] = useState<boolean>(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [openDeleteUser, setOpenDeleteUser] = useState<boolean>(false);

  const headers: TableHeader[] = [
    { name: "image", className: "px-3 py-2" },
    {
      name: "fullName",
      className: "px-3 py-2",
      sortable: true,
      key: "fullname",
    },
    { name: "email", className: "px-3 py-2", sortable: true, key: "email" },
    { name: "mobile", className: "px-3 py-2", sortable: true, key: "phone" },
    { name: "type", className: "px-3 py-2", sortable: true, key: "role" },
    {
      name: "createdAt",
      className: "px-3 py-2",
      sortable: true,
      key: "createdAt",
    },
    { name: "action", className: "px-3 py-2 flex justify-center" },
  ];

  const handelRestore = async (id: string) => {
    try {
      setPending(true);
      const { data } = await axios.put(
        `/api/users/${id}`,
        { isDeleted: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      dispatch(updateUser(data.user));
      toast.success(t("successRestore"));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? "There is an Error");
    } finally {
      setPending(false);
    }
  };

  const totalCount = useAppSelector((state) => state.users.count);
  const usersRedux = useAppSelector((state) => state.users.users);

  useEffect(() => {
    dispatch(setUsers(users));
    dispatch(setUsersCount(count));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
            {t("users")}
          </h4>
        </div>
        <button
          onClick={() => setAddUser(!addUser)}
          className="px-5 py-2 flex gap-3 justify-center items-center bg-primary rounded-md text-white font-medium"
        >
          {addUser ? (
            t("close")
          ) : (
            <>
              <PlusCircleIcon className="size-5" />
              {t("addUser")}
            </>
          )}
        </button>
      </div>
      {!addUser && (
        <Table
          headers={headers}
          pagination={
            <Pagination
              count={totalCount}
              totalPages={totalPages}
              downloadButton={
                <DownloadButton<User>
                  model="user"
                  fields={["fullname", "email", "phone", "createdAt"]}
                  items={["fullname", "email", "phone"]}
                />
              }
            />
          }
        >
          {!usersRedux.length && (
            <tr className="odd:bg-white even:bg-primary/5 border-b">
              <td
                colSpan={headers.length}
                scope="row"
                className="px-6 py-4 text-center font-bold"
              >
                {t("no data yet")}
              </td>
            </tr>
          )}
          {usersRedux?.map((user: User) => (
            <tr
              key={user.id}
              className={clsx(
                "odd:bg-white even:bg-[#F0F2F5]  border-b",
                user.isDeleted && "!text-red-500 font-bold"
              )}
            >
              <td className="px-3 py-2">
                <div className="size-12">
                  <ImageApi
                    src={user.imageUrl ?? "/imgs/notfound.png"}
                    loading="lazy"
                    alt="Avatar"
                    className="size-full rounded-full object-cover border-2"
                    width={200}
                    height={200}
                  />
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{user.fullname}</td>
              <td className="px-3 py-2 whitespace-nowrap">{user.email}</td>
              <td dir="ltr" className="px-3 py-2 whitespace-nowrap">
                {user.phone}
              </td>
              <td className={"px-3 py-2 whitespace-nowrap"}>{user.role}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {DateToText(user.createdAt ?? "", locale)}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2 justify-center items-center">
                  {user.isDeleted ? (
                    <button
                      onClick={() => handelRestore(user.id)}
                      className="flex gap-2 justify-center hover:text-gray-700 transition-colors"
                    >
                      {pending && (
                        <LoadingIcon className="size-5 animate-spin" />
                      )}
                      {!pending && (
                        <RestoreIcon className="size-5 !text-red-500 font-bold" />
                      )}
                    </button>
                  ) : (
                    <>
                      <Link
                        className="text-primary hover:text-gray-700 transition-colors"
                        href={`/users/${user.id}`}
                      >
                        <EditIcon className="size-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteUser(user);
                          setOpenDeleteUser(true);
                        }}
                        className="text-primary hover:text-gray-700 transition-colors"
                      >
                        <DeleteIcon className="size-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
      {addUser && <AddUserForm handelClose={() => setAddUser(false)} />}
      {deleteUser && !addUser && (
        <DeleteUser
          openDelete={openDeleteUser}
          setOpenDelete={setOpenDeleteUser}
          user={deleteUser}
        />
      )}
    </div>
  );
};

export default UsersRows;
