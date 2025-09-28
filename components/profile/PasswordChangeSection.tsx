"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import UserInput from "@/components/users/UserInput";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAppContext } from "@/context/appContext";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeSection = () => {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { token } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>();

  const newPassword = watch("newPassword");
  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    return {
      minLength,
      isValid: minLength,
    };
  };

  const passwordValidation = newPassword ? validatePassword(newPassword) : null;
  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(
        `/api/profile/change-password`,
        {
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept-language": locale,
          },
        }
      );

      if (response.data) {
        toast.success(t("passwordUpdated"));
        reset();
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.response?.status === 400) {
        toast.error(t("invalidCurrentPassword"));
      } else {
        toast.error(
          error.response?.data?.message ?? "Failed to update password"
        );
      }
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
            <Shield className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("changePassword")}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Password Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div className="md:col-span-2">
              <UserInput
                fieldForm="currentPassword"
                labelIcon={<Shield className="size-4 text-gray-500" />}
                placeholder={t("currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                register={register}
                roles={{
                  required: t("currentPasswordRequired"),
                }}
                errors={errors}
                disabled={isSubmitting || isLoading}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    disabled={isSubmitting || isLoading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />
            </div>

            {/* New Password */}
            <UserInput
              fieldForm="newPassword"
              labelIcon={<Lock className="size-4 text-gray-500" />}
              placeholder={t("newPassword")}
              type={showNewPassword ? "text" : "password"}
              register={register}
              roles={{
                required: t("newPasswordRequired"),
                minLength: {
                  value: 6,
                  message: t("passwordTooShort"),
                },
                validate: (value) => {
                  const validation = validatePassword(value);
                  if (!validation.isValid) {
                    return t("passwordTooShort");
                  }
                  return true;
                },
              }}
              errors={errors}
              disabled={isSubmitting || isLoading}
              icon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isSubmitting || isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />

            {/* Confirm Password */}
            <UserInput
              fieldForm="confirmPassword"
              labelIcon={<Lock className="size-4 text-gray-500" />}
              placeholder={t("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              register={register}
              roles={{
                required: t("confirmPasswordRequired"),
                validate: (value) =>
                  value === newPassword || t("passwordsDoNotMatch"),
              }}
              errors={errors}
              disabled={isSubmitting || isLoading}
              icon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isSubmitting || isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
          </div>{" "}
          {/* Password Requirements */}
          {newPassword && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="size-4 text-primary" />
                {t("passwordRequirements")}
              </h4>
              <div className="flex items-center gap-2">
                <CheckCircle
                  className={`size-4 ${
                    passwordValidation?.minLength
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span
                  className={`text-sm ${
                    passwordValidation?.minLength
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  {t("minLength")}
                </span>
              </div>
            </div>
          )}
          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={
                isSubmitting || isLoading || !passwordValidation?.isValid
              }
              className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("loading")}...
                </div>
              ) : (
                t("updatePassword")
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                {t("securityTips")}
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• {t("securityTip1")}</li>
                <li>• {t("securityTip2")}</li>
                <li>• {t("securityTip3")}</li>
                <li>• {t("securityTip4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeSection;
