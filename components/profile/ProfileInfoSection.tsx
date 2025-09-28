"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import {
  User as UserIcon,
  Phone,
  Users,
  Calendar,
  Globe,
  Mail,
} from "lucide-react";
import { useAppContext } from "@/context/appContext";
import UserInput from "@/components/users/UserInput";
import CustomSelect from "@/components/users/CustomSelect";
import CustomDatePicker from "@/components/CustomDatePicker";
import ProfileImageUpload from "./ProfileImageUpload";
import axios from "axios";
import { toast } from "react-hot-toast";

interface ProfileFormData {
  fullname: string;
  phone: string;
  email: string;
  gender: string;
  birthDate: string;
  lang: string;
  imageFile?: FileList;
}

const ProfileInfoSection = () => {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { user, updateUser, token } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.imageUrl
  );
  const [deleteImage, setDeleteImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    resetField,
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullname: user.fullname || "",
      phone: user.phone || "",
      email: user.email || "",
      gender: user.gender || "",
      birthDate: user.birthDate
        ? new Date(user.birthDate).toISOString().split("T")[0]
        : undefined,
      lang: user.lang ?? undefined,
      imageFile: undefined,
    },
  });

  const genderOptions = [
    { value: "MALE", label: t("male") },
    { value: "FEMALE", label: t("female") },
  ];

  const languageOptions = [
    { value: "AR", label: "عربي" },
    { value: "EN", label: "English" },
  ];

  const handleDeleteImage = () => {
    setDeleteImage(true);
    setImagePreview(null);
    resetField("imageFile");
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      if (data.fullname !== user.fullname)
        formData.append("fullname", data.fullname);

      if (data.gender !== user.gender) formData.append("gender", data.gender);

      // Compare birthDate properly
      const userBirthDateFormatted = user.birthDate
        ? new Date(user.birthDate).toISOString().split("T")[0]
        : null;

      if (data.birthDate && data.birthDate !== userBirthDateFormatted)
        formData.append("birthDate", data.birthDate);

      if (data.lang !== user.lang) formData.append("lang", data.lang);

      // Add image file if selected
      if (data.imageFile && data.imageFile.length > 0)
        formData.append("imageUrl", data.imageFile[0]);

      if (user.role === "ADMIN" && data.phone !== user.phone)
        formData.append("phone", data.phone);
      if (user.role === "ADMIN" && data.email !== user.email)
        formData.append("email", data.email);

      // Add delete image flag if user wants to delete the image
      if (deleteImage && user.imageUrl) formData.append("deleteImage", "true");

      if (Array.from(formData.entries()).length === 0) {
        toast.error(t("noChangesMade"));
        return;
      }

      const response = await axios.put(`/api/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          "accept-language": locale,
        },
      });

      if (response.data) {
        console.log(response.data.updatedUser);

        updateUser({
          ...response.data.updatedUser,
        });
        if (response.data.updatedUser.imageUrl)
          setImagePreview(response.data.updatedUser.imageUrl);

        setDeleteImage(false);
        toast.success(t("infoUpdated"));
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message ?? t("failedToUpdateProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-full">
            <UserIcon className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("generalInfo")}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Image Section */}
          <div className="flex justify-center">
            <ProfileImageUpload
              fieldForm="imageFile"
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              register={register}
              onDeleteImage={handleDeleteImage}
              deleteImage={deleteImage}
              setDeleteImage={setDeleteImage}
            />
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <UserInput
              fieldForm="fullname"
              labelIcon={<UserIcon className="size-4 text-gray-500" />}
              label={t("fullName")}
              register={register}
              roles={{
                required: t("fullNameRequired"),
                minLength: {
                  value: 2,
                  message: t("fullNameTooShort"),
                },
                maxLength: {
                  value: 50,
                  message: t("fullNameTooLong"),
                },
              }}
              errors={errors}
              disabled={isLoading}
            />

            {/* Phone */}
            <UserInput
              fieldForm="phone"
              labelIcon={<Phone className="size-4 text-gray-500" />}
              label={t("phone")}
              type="tel"
              register={register}
              roles={{
                required: false,
              }}
              errors={errors}
              disabled={isLoading || user.role !== "ADMIN"}
            />

            {/* Email */}
            <UserInput
              fieldForm="email"
              labelIcon={<Mail className="size-4 text-gray-500" />}
              label={t("email")}
              type="email"
              register={register}
              roles={{
                required: false,
              }}
              errors={errors}
              disabled={isLoading || user.role !== "ADMIN"}
            />

            {/* Gender */}
            <CustomSelect
              fieldForm="gender"
              label={t("gender")}
              labelIcon={<Users className="size-4 text-gray-500" />}
              defaultValue={user.gender}
              options={genderOptions}
              register={register}
              roles={{ required: t("genderRequired") }}
              errors={errors}
              placeholder={t("selectGender")}
              disabled={isLoading}
            />

            {/* Language */}
            <CustomSelect
              fieldForm="lang"
              label={t("language")}
              labelIcon={<Globe className="size-4 text-gray-500" />}
              options={languageOptions}
              defaultValue={user.lang}
              register={register}
              roles={{ required: t("languageRequired") }}
              errors={errors}
              placeholder={t("selectLanguage")}
              disabled={isLoading}
            />

            {/* Birth Date */}
            <CustomDatePicker
              errors={errors}
              label={t("birthDate")}
              labelIcon={<Calendar className="size-4 text-gray-500" />}
              fieldForm="birthDate"
              control={control}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("loading")}...
                </div>
              ) : (
                t("updateInfo")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
