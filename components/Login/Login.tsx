"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import ChangeLanguage from "./ChangeLanguage";
import LoginForm from "./LoginForm";
import ForgotPassword from "./ForgotPassword";
import SignInWithGoogle from "./SignInWithGoogle";
import SignInWithApple from "./SignInWithApple";

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
        <div className="flex justify-center bg-black p-4 rounded-lg mb-6">
          <Image
            src="/imgs/logo.svg"
            alt="library Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        <SignInWithGoogle />
        <SignInWithApple />
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
