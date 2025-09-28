"use client";
import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import UserInput from "../UserInput";
import { useTranslations } from "next-intl";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  FieldValues,
  Control,
  UseFormWatch,
} from "react-hook-form";
import { User } from "@/redux/reducers/usersReducer";
import CustomDatePicker from "@/components/CustomDatePicker";
import { ShowPassword } from "../AddUserForm";
import PhoneInput from "@/components/PhoneInput";
import { useAppContext } from "@/context/appContext";

const UserDetailsForm = ({
  user,
  register,
  errors,
  setValue,
  control,
  handleFieldClick,
  watch,
}: {
  user: User;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  control: Control<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  handleFieldClick: () => void;
  watch: UseFormWatch<FieldValues>;
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { user: loggedUser } = useAppContext();

  const t = useTranslations("user");
  return (
    <div className="flex flex-col gap-5">
      <UserInput
        roles={{
          value: user.fullname,
          minLength: { value: 2, message: t("fullNameMinLength") },
          maxLength: { value: 50, message: t("fullNameMaxLength") },
        }}
        errors={errors}
        onClick={handleFieldClick}
        defaultValue={user.fullname}
        fieldForm="fullname"
        register={register}
        label={t("fullName")}
      />
      <CustomSelect
        roles={{ value: user.gender }}
        defaultValue={user.gender}
        errors={errors}
        label={t("gender")}
        fieldForm="gender"
        register={register}
        onClick={handleFieldClick}
        options={[
          { value: "MALE", label: t("male") },
          { value: "FEMALE", label: t("female") },
        ]}
      />
      <CustomDatePicker
        errors={errors}
        label={t("birthday")}
        fieldForm="birthDate"
        control={control}
        defaultValue={
          user.birthDate
            ? new Date(user.birthDate).toISOString().split("T")[0]
            : undefined
        }
        onClick={handleFieldClick}
      />

      <UserInput
        roles={{ value: user.email }}
        errors={errors}
        defaultValue={user.email}
        fieldForm="email"
        register={register}
        label={t("email")}
        disabled={loggedUser.role !== "ADMIN"}
        onClick={handleFieldClick}
      />

      <PhoneInput
        fieldForm="phone"
        label={t("phone")}
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        roles={{ value: user.phone }}
        defaultValue={user.phone}
        disabled={loggedUser.role !== "ADMIN"}
        onClick={handleFieldClick}
      />

      <UserInput
        roles={{ minLength: { value: 6, message: t("passwordError") } }}
        errors={errors}
        onClick={handleFieldClick}
        register={register}
        label={t("password")}
        fieldForm="password"
        type={showPassword ? "text" : "password"}
        icon={
          <ShowPassword
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        }
        autoComplete="new-password"
      />

      <CustomSelect
        key={"isActive"}
        roles={{ value: String(user.isActive) }}
        errors={errors}
        label={t("status")}
        defaultValue={String(user.isActive)}
        fieldForm="isActive"
        register={register}
        onClick={handleFieldClick}
        options={[
          { value: "true", label: t("active") },
          { value: "false", label: t("blocked") },
        ]}
      />

      <CustomSelect
        key={"lang"}
        roles={{ value: user.lang }}
        errors={errors}
        label={t("language")}
        defaultValue={user.lang}
        fieldForm="lang"
        register={register}
        onClick={handleFieldClick}
        options={[
          { value: "AR", label: "عربي" },
          { value: "EN", label: "English" },
        ]}
      />

      <CustomSelect
        key={"isConfirmed"}
        roles={{ value: String(user.isConfirmed) }}
        errors={errors}
        label={t("confirmed")}
        defaultValue={String(user.isConfirmed)}
        fieldForm="isConfirmed"
        register={register}
        onClick={handleFieldClick}
        options={[
          { value: "true", label: t("true") },
          { value: "false", label: t("false") },
        ]}
      />
    </div>
  );
};

export default UserDetailsForm;
