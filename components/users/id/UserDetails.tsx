"use client";
import { LoadingIcon } from "@/components/icons";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { DateToText } from "@/lib/DateToText";
import { sliceText } from "@/lib/sliceText";
import { updateUser, User } from "@/redux/reducers/usersReducer";
import axios from "axios";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DeleteUser from "./DeleteUser";
import UserBadge from "./UserBadge";
import UserDetailsForm from "./UserDetailsForm";
import CustomSelect from "../CustomSelect";
import { fetchRoles } from "@/lib/fetchRoles";
import FetchSelect from "@/components/FetchSelect";
import { UserRole } from "@/types/userRole";

const UserDetails = ({ user }: { user: User }) => {
  const t = useTranslations("user");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    resetField,
    watch,
  } = useForm();
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token, user: loggedUser } = useAppContext();
  const dispatch = useAppDispatch();
  const [image, setImage] = useState("");
  const [deleteImage, setDeleteImage] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(user);
  const locale = useLocale() as "en" | "ar";

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      let userData = { ...formData };
      delete userData.password;
      delete userData.phone;
      delete userData.email;
      delete userData.imageFile;

      if (formData.imageFile[0]) {
        userData.image_url = formData.imageFile[0];
      }

      if (loggedUser.role === "admin" && formData.phone !== loggedUser.phone) {
        userData.phone = formData.phone;
      }
      if (loggedUser.role === "admin" && formData.email !== loggedUser.email) {
        userData.email = formData.email;
      }

      if (formData.password) {
        userData.password = formData.password;
      }

      if (deleteImage && user.image_url) {
        userData.deleteImage = true;
      }

      const { data } = await axios.put(
        `/api/users/${user.id}`,
        { ...userData },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        },
      );
      dispatch(updateUser(data.user));
      setCurrentUser(data.user); // Update current user state

      setIsEditable(false);
      toast.success("Successfully Updated!!!");
      URL.revokeObjectURL(image);
      setImage("");
      setDeleteImage(false);
      resetField("imageFile");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "There is an Error");
    } finally {
      setLoading(false);
    }
  });

  const handleFieldClick = () => {
    setIsEditable(true);
  };

  const handleDeleteImage = () => {
    setDeleteImage(true);
    setIsEditable(true);
    setImage("");
  };

  return (
    <div className="space-y-10 bg-white p-3 md:p-5 rounded-3xl">
      <title>{currentUser?.full_name}</title>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-7"
      >
        <div className="flex flex-col gap-3">
          <UserBadge
            user={currentUser}
            handleFieldClick={handleFieldClick}
            image={image}
            setImage={setImage}
            register={register}
            onDeleteImage={handleDeleteImage}
            deleteImage={deleteImage}
          />
          <FetchSelect<UserRole>
            fieldForm="role_id"
            label={t("role")}
            placeholder={""}
            fetchFunction={(params) => fetchRoles({ ...params, token })}
            getOptionLabel={(role) => role.name}
            getOptionValue={(role) => role.id}
            roles={{ required: t("roleRequired") }}
            defaultValues={[user.role]}
            register={register}
            setValue={setValue}
            errors={errors}
            onChange={(e) => setIsEditable(user.role.name !== e[0].name)}
          />
        </div>
        <div className="w-full contents">
          <div>
            <UserDetailsForm
              control={control}
              errors={errors}
              user={currentUser}
              register={register}
              setValue={setValue}
              handleFieldClick={handleFieldClick}
              watch={watch}
            />
          </div>
          <div className="flex flex-col ">
            <div className="bg-[#F0F2F5] p-5 rounded-xl space-y-5">
              <div className="flex justify-between flex-wrap items-center">
                <p className={clsx("font-medium text-sm text-left")}>
                  CreatedAt:
                </p>
                <div className="text-sm text-nowrap">
                  {DateToText(user?.created_at ?? "", locale)}
                </div>
              </div>
              <div className="flex justify-between flex-wrap items-center">
                <p className={clsx("font-medium text-sm text-left")}>
                  UpdatedAt:
                </p>
                <div className="text-sm text-nowrap">
                  {DateToText(user?.updated_at ?? "", locale)}
                </div>
              </div>
              <div className="flex justify-between flex-wrap items-center">
                <p className={clsx("font-medium text-sm text-left")}>
                  PasswordLastUpdated:
                </p>
                <div className="text-sm text-nowrap">
                  {DateToText(user?.password_last_updated ?? "", locale)}
                </div>
              </div>
              <div className="flex justify-between flex-wrap items-center">
                <p className={clsx("font-medium text-sm text-left")}>
                  LastLoginAt:
                </p>
                <div className="text-sm text-nowrap">
                  {DateToText(user?.last_login_at ?? "", locale)}
                </div>
              </div>
              <div className="flex justify-between flex-wrap items-center">
                <p className={clsx("font-medium text-sm text-left")}>uuid:</p>
                <div>{user.id}</div>
              </div>
              {/* {user?.UserAddress?.length ? (
                "no addresses "
              ) : (
                <div>
                  <h5>Addresses: </h5>
                  <ul>
                    {user?.UserAddress.map((address: any, i: any) => (
                      <li key={address.id}>
                        <span>{i + 1} - </span>
                        <Link
                          className="hover:text-red-500 duration-500"
                          href={`https://www.google.com/maps?q=${address.lat},${address.long}`}
                          target="_blank"
                        >
                          {sliceText(address.address, 40)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </div>
            <div className="flex gap-1 justify-center w-full mt-auto max-md:mt-5 mb-5">
              {isEditable && (
                <>
                  <button
                    type="submit"
                    className="py-2  w-1/2 rounded-2xl text-sm bg-primary text-white"
                  >
                    {loading ? (
                      <LoadingIcon className="w-6 h-6 animate-spin m-auto hover:stroke-white" />
                    ) : (
                      t("updateProfile")
                    )}
                  </button>
                  <button
                    type="reset"
                    onClick={() => setIsEditable(false)}
                    className="py-2  w-1/2 rounded-2xl border-black border text-sm text-black"
                  >
                    {t("cancel")}
                  </button>
                </>
              )}
            </div>
            <DeleteUser
              openDelete={openDeleteUser}
              setOpenDelete={setOpenDeleteUser}
              user={user}
              showBtn
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
