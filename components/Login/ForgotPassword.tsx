"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import UserInput from "@/components/users/UserInput";
import axios from "axios";
import { toast } from "react-hot-toast";
import libphonenumber from "libphonenumber-js";

interface ForgotPasswordFormData {
  phoneOrEmail: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const t = useTranslations("login");
  const lang = useLocale();
  const [step, setStep] = useState<"contact" | "otp" | "password">("contact");
  const [isLoading, setIsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [callCode, setCallCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      phoneOrEmail: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedContact = watch("phoneOrEmail");
  const watchedNewPassword = watch("newPassword");
  const watchedOtp = watch("otp");
  // Auto-detect country code for phone numbers
  useEffect(() => {
    if (
      watchedContact.startsWith("010") ||
      watchedContact.startsWith("011") ||
      watchedContact.startsWith("012") ||
      watchedContact.startsWith("015")
    ) {
      setCallCode("+2");
    } else if (
      watchedContact.startsWith("05") ||
      watchedContact.startsWith("5")
    ) {
      setCallCode("+966");
    }
  }, [watchedContact]);

  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  const validatePhoneOrEmail = (value: string): true | string => {
    if (!value) return t("error.email");

    if (value.includes("@")) {
      return isValidEmail(value) ? true : t("error.invalidEmail");
    }

    // Format Saudi phone numbers: remove leading 0 if starts with 05
    let formattedPhone = value;
    if (value.startsWith("05")) {
      formattedPhone = value.substring(1); // Remove the leading 0
    }

    if (!libphonenumber(`${callCode}${formattedPhone}`)?.isValid()) {
      return t("error.invalidPhone");
    }

    return true;
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    return {
      minLength,
      isValid: minLength,
    };
  };

  const passwordValidation = watchedNewPassword
    ? validatePassword(watchedNewPassword)
    : null;
  // Step 1: Send OTP
  const handleSendOTP = async (data: ForgotPasswordFormData) => {
    if (!data.phoneOrEmail) {
      toast.error(t("enterPhoneOrEmail"));
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number for Saudi numbers
      let formattedContact = data.phoneOrEmail;
      if (
        data.phoneOrEmail.startsWith("05") &&
        !data.phoneOrEmail.includes("@")
      ) {
        formattedContact = data.phoneOrEmail.substring(1); // Remove leading 0 for Saudi numbers
      }

      const response = await axios.patch(
        `/api/users/forget-password?lang=${lang}`,
        {
          phone: formattedContact,
        }
      );

      if (response.data) {
        setContactInfo(data.phoneOrEmail);
        setStep("otp");
        toast.success(`${t("otpSent")} ${data.phoneOrEmail}`);
      }
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      toast.error(error.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };
  // Step 2: Verify OTP and set new password
  const handleVerifyAndReset = async (data: ForgotPasswordFormData) => {
    if (!data.otp) {
      toast.error(t("enterOTPCode"));
      return;
    }

    if (!data.newPassword) {
      toast.error(t("enterNewPassword"));
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number for Saudi numbers
      let formattedContact = contactInfo;
      if (contactInfo.startsWith("05") && !contactInfo.includes("@")) {
        formattedContact = contactInfo.substring(1); // Remove leading 0 for Saudi numbers
      }

      const response = await axios.patch(
        `/api/users/forget-password/reset-password?lang=${lang}`,
        {
          code: data.otp,
          phone: formattedContact,
          password: data.newPassword,
        }
      );

      if (response.data) {
        toast.success(t("passwordReset"));
        reset();
        onBackToLogin();
      }
    } catch (error: any) {
      console.error("Reset Password Error:", error);
      toast.error(error.response?.data?.message ?? "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("contact");
    setContactInfo("");
    reset();
  };

  const getStepContent = () => {
    switch (step) {
      case "contact":
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t("resetPasswordTitle")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("resetPasswordSubtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-4">
              <UserInput
                fieldForm="phoneOrEmail"
                labelIcon={
                  watchedContact.includes("@") ? (
                    <Mail className="size-4 text-gray-500" />
                  ) : (
                    <Phone className="size-4 text-gray-500" />
                  )
                }
                placeholder={t("enterEmailOrPhone")}
                register={register}
                roles={{
                  required: t("enterPhoneOrEmail"),
                  validate: validatePhoneOrEmail,
                }}
                errors={errors}
                disabled={isSubmitting || isLoading}
              />

              <button
                type="submit"
                disabled={isSubmitting || isLoading || !watchedContact}
                className="w-full p-3 bg-primary text-white rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  t("sendOTP")
                )}
              </button>
            </form>
          </>
        );

      case "otp":
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t("otpVerificationTitle")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("otpVerificationSubtitle")}: <strong>{contactInfo}</strong>
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleVerifyAndReset)}
              className="space-y-4"
            >
              <UserInput
                fieldForm="otp"
                labelIcon={<Shield className="size-4 text-gray-500" />}
                placeholder={t("enterOTP")}
                type="text"
                register={register}
                roles={{
                  required: t("enterOTPCode"),
                  minLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                  maxLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                }}
                errors={errors}
                disabled={isSubmitting || isLoading}
                maxLength={6}
              />

              <UserInput
                fieldForm="newPassword"
                labelIcon={<Lock className="size-4 text-gray-500" />}
                placeholder={t("newPassword")}
                type={showNewPassword ? "text" : "password"}
                register={register}
                roles={{
                  required: t("enterNewPassword"),
                  minLength: {
                    value: 6,
                    message: t("error.passwordLength"),
                  },
                  validate: (value) => {
                    const validation = validatePassword(value);
                    if (!validation.isValid) {
                      return t("error.passwordLength");
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

              <UserInput
                fieldForm="confirmPassword"
                labelIcon={<Lock className="size-4 text-gray-500" />}
                placeholder={t("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                register={register}
                roles={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchedNewPassword || t("passwordsDoNotMatch"),
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

              {/* Password Requirements */}
              {watchedNewPassword && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                      At least 6 characters
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 p-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoading ||
                    !watchedOtp ||
                    !passwordValidation?.isValid
                  }
                  className="flex-1 p-3 bg-primary text-white rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    t("verifyOTP")
                  )}
                </button>
              </div>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBackToLogin}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="size-4" />
        {t("backToLogin")}
      </button>

      {getStepContent()}
    </div>
  );
};

export default ForgotPassword;
