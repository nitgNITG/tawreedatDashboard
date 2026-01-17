"use client";
import { useRouter } from "@/i18n/routing";
import { setCookie } from "@/lib/setCookie";
import axios from "axios";
import libphonenumber from "libphonenumber-js";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { LoadingIcon, PasswordIcon, PhoneIcon } from "../icons";
import { ShowPassword } from "../users/AddUserForm";
import UserInput from "../users/UserInput";
interface LoginFormProps {
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      phone: "",
      password: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const lang = useLocale();

  const t = useTranslations("login");
  const onSubmit = async (formData: { password: string; phone: string }) => {
    try {
      setLoading(true);

      // Format phone number for Saudi numbers
      let formattedPhone = formData.phone;
      if (formData.phone.startsWith("05")) {
        formattedPhone = formData.phone.substring(1); // Remove leading 0 for Saudi numbers
      }
      console.log("Formatted Phone:", formattedPhone);

      const { data: loginData } = await axios.post(
        `/api/auth/login?lang=${lang}`,
        {
          ...(formattedPhone.includes("@")
            ? { email: formattedPhone }
            : { phone: formattedPhone }),
          password: formData.password,
        }
      );
      

      if (loginData.user.role !== "admin") {
        console.log("not admin");

        throw new Error(
          "Only administrators or brand representative can access this portal"
        );
      }

      setCookie("token", loginData.token, 360);
      toast.success(loginData.message as string);

      router.refresh();
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(
        error?.response?.data?.message ?? error.message ?? "There is an Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const [callCode, setCallCode] = useState("");
  const phone = watch("phone");

  const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  useEffect(() => {
    if (
      phone.startsWith("010") ||
      phone.startsWith("011") ||
      phone.startsWith("012") ||
      phone.startsWith("015")
    ) {
      setCallCode("+2");
    } else if (phone.startsWith("05") || phone.startsWith("5")) {
      setCallCode("+966");
    }
  }, [phone]);
  const validatePhone = (phone: string | boolean): true | string => {
    if (typeof phone !== "string") {
      return t("error.invalidPhoneFormat");
    }

    if (phone.includes("@")) {
      return isValidEmail(phone) ? true : t("error.invalidEmail");
    }

    // Format Saudi phone numbers: remove leading 0 if starts with 05
    let formattedPhone = phone;
    if (phone.startsWith("05")) {
      formattedPhone = phone.substring(1); // Remove the leading 0
    }

    if (!libphonenumber(`${callCode}${formattedPhone}`)?.isValid()) {
      return t("error.invalidPhone");
    }

    return true;
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <UserInput
        roles={{
          required: t("error.email"),
          validate: validatePhone,
        }}
        placeholder={t("email")}
        errors={errors}
        register={register}
        labelIcon={<PhoneIcon />}
        fieldForm="phone"
      />
      <UserInput
        roles={{
          required: t("error.password"),
          minLength: { value: 6, message: t("error.passwordLength") },
        }}
        errors={errors}
        register={register}
        labelIcon={<PasswordIcon />}
        fieldForm="password"
        placeholder={t("password")}
        type={showPassword ? "text" : "password"}
        icon={
          <ShowPassword
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        }
        className="w-full"
      />
      {/* Forgot Password Link */}{" "}
      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-secondary hover:text-secondary/80 transition-colors underline"
        >
          {t("forgotPassword")}
        </button>
      </div>
      <button className="p-3 w-24 rounded-2xl bg-primary border text-sm text-white flex justify-center items-center hover:bg-white/90 hover:text-primary hover:border-primary transition-colors duration-200 mx-auto">
        {loading ? <LoadingIcon className="size-5 animate-spin" /> : t("btn")}
      </button>
    </form>
  );
};

export default LoginForm;
