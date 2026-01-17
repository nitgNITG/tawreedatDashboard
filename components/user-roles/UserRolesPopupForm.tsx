"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { LoadingIcon } from "../icons";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import UserInput from "../users/UserInput";
import { UserRole } from "@/types/userRole";

type FormValues = {
  name: string;
  description?: string;
};

const UserRolesPopupForm = ({
  openForm,
  setOpenForm,
  role,
  setRole,
  onSaved,
}: {
  role?: UserRole;
  setRole?: (role: UserRole | undefined) => void;
  openForm: boolean;
  setOpenForm: (open: boolean) => void;
  onSaved: (role: UserRole) => void;
}) => {
  const { token } = useAppContext();
  const t = useTranslations("userRoles");
  const [loading, setLoading] = useState(false);

  const isUpdate = !!role?.id;

  const defaultValues = useMemo<FormValues>(
    () => ({
      name: role?.name ?? "",
      description: role?.description ?? "",
    }),
    [role],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleSave = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
      };

      const { data } = isUpdate
        ? await axios.put(`/api/roles/${role?.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(`/api/roles`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      onSaved(data.data);

      toast.success(
        isUpdate ? t("toast.updateSuccess") : t("toast.createSuccess"),
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("toast.genericError"));
    } finally {
      setLoading(false);
      setOpenForm(false);
    }
  });

  const handleClose = () => {
    reset({ name: "", description: "" });
    setRole?.(undefined);
    setOpenForm(false);
  };

  let buttonContent: React.ReactNode;
  if (loading) buttonContent = <LoadingIcon className="size-5 animate-spin" />;
  else if (isUpdate) buttonContent = t("edit");
  else buttonContent = t("add");

  return (
    <Dialog open={openForm} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? t("updateTitle") : t("addTitle")}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="space-y-5">
            <UserInput
              fieldForm="name"
              label={t("name")}
              roles={{ required: t("nameIsRequired") }}
              register={register}
              readOnly={!!role?.name}
              errors={errors}
            />

            <UserInput
              fieldForm="description"
              label={t("description")}
              roles={{ required: false }}
              register={register}
              errors={errors}
            />

            <div className="w-full flex justify-center gap-4">
              <button
                disabled={loading}
                className="py-1 px-12 rounded-3xl bg-primary text-white flex justify-center"
              >
                {buttonContent}
              </button>

              <button
                className="py-1 px-12 rounded-3xl border-1"
                type="reset"
                onClick={handleClose}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserRolesPopupForm;
