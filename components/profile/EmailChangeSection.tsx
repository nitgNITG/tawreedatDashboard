"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useAppContext } from "@/context/appContext";
import { Mail, Shield, ArrowRight, CheckCircle } from "lucide-react";
import UserInput from "@/components/users/UserInput";
import axios from "axios";
import { toast } from "react-hot-toast";

interface EmailChangeFormData {
  newEmail: string;
  otp: string;
}

const EmailChangeSection = () => {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { user, updateUser, token } = useAppContext();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EmailChangeFormData>({
    defaultValues: {
      newEmail: "",
      otp: "",
    },
  });

  const watchedEmail = watch("newEmail");
  const watchedOtp = watch("otp");
  const handleSendOTP = async (data: EmailChangeFormData) => {
    if (!data.newEmail) {
      toast.error(t("enterNewEmail"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(
        `/api/profile/change-email`,
        { email: data.newEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );

      if (response.data) {
        setPendingEmail(data.newEmail);
        setStep("otp");
        toast.success(t("otpSent") + " " + data.newEmail);
      }
    } catch (error: any) {
      console.error("Email change error:", error);
      toast.error(error.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: EmailChangeFormData) => {
    if (!data.otp) {
      toast.error(t("otpRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `/api/profile/confirm-otp`,
        { code: data.otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );

      if (response.data) {
        updateUser({ email: pendingEmail });
        setStep("email");
        setPendingEmail("");
        reset();
        toast.success(t("emailUpdated"));
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message ?? t("invalidOTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("email");
    setPendingEmail("");
    reset();
  };

  const onSubmit = (data: EmailChangeFormData) => {
    if (step === "email") {
      handleSendOTP(data);
    } else {
      handleVerifyOTP(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-full">
            <Mail className="size-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("changeEmail")}
          </h3>
        </div>

        {/* Current Email Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">{t("email")}:</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === "email"
                  ? "bg-primary text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {step === "otp" ? <CheckCircle className="size-4" /> : "1"}
            </div>
            <div
              className={`w-12 h-0.5 ${
                step === "otp" ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === "otp"
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              <Shield className="size-4" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === "email" ? (
            <>
              {/* New Email Step */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  {t("newEmailAddress")}
                </h4>
                <UserInput
                  fieldForm="newEmail"
                  labelIcon={<Mail className="size-4 text-gray-500" />}
                  placeholder={t("newEmailAddress")}
                  type="email"
                  register={register}
                  roles={{
                    required: t("emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("invalidEmail"),
                    },
                  }}
                  errors={errors}
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !watchedEmail}
                  className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("loading")}...
                    </>
                  ) : (
                    <>
                      {t("sendOTP")}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("verifyOTP")}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("otpSent")}: <strong>{pendingEmail}</strong>
                  </p>
                </div>

                <UserInput
                  fieldForm="otp"
                  labelIcon={<Shield className="size-4 text-gray-500" />}
                  placeholder={t("enterOTP")}
                  type="text"
                  register={register}
                  roles={{
                    required: t("otpRequired"),
                    minLength: {
                      value: 6,
                      message: t("otpLength"),
                    },
                    maxLength: {
                      value: 6,
                      message: t("otpLength"),
                    },
                  }}
                  errors={errors}
                  disabled={isSubmitting || isLoading}
                  maxLength={6}
                />
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t("changeEmail")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !watchedOtp}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("loading")}...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      {t("verifyOTP")}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmailChangeSection;
