"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import ChangeLanguage from "./ChangeLanguage";
import LoginForm from "./LoginForm";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const t = useTranslations("login");
  const [currentView, setCurrentView] = useState<"login" | "forgot">("login");

  const handleShowForgotPassword = () => {
    setCurrentView("forgot");
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };
  return (
    <div className="w-full min-h-screen bg-[#241234] flex justify-center items-center">
      <div className="bg-white w-full max-w-[447px] rounded-[24px] p-8">
        <div className="flex justify-center">
          <Image
            src="/imgs/logo.svg"
            alt="library Logo"
            width={120}
            height={40}
            className="object-contain w-auto h-auto"
          />
        </div>
        {currentView === "login" ? (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{t("welcome_login_big")}</h1>
              <p className="text-gray-600">{t("welcome_login_text")}</p>
            </div>
            <LoginForm onForgotPassword={handleShowForgotPassword} />
          </>
        ) : (
          <ForgotPassword onBackToLogin={handleBackToLogin} />
        )}
        <ChangeLanguage />
      </div>
    </div>
  );
};

export default Login;
