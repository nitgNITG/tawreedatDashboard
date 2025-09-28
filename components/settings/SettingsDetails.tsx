"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { BasicInfoSection } from "./BasicInfoSection";
import { DisplaySettingsSection } from "./DisplaySettingsSection";
import { SettingsHeader } from "./SettingsHeader";
import { SectionWrapper } from "./SectionWrapper";

interface SettingsData {
  numberOfProductsOnHomepage: number;
  numberOfFeaturedProductsOnHomepage: number;
  numberOfCategoriesOnHomepage: number;
  numberOfLatestOffersOnHomepage: number;
  numberOfNewArrivalsOnHomepage: number;
  loginAttemptDurationMinutes: number;
  loginAttempts: number;
  permanentDelete: boolean;
  loginAsGuest: boolean;
  vat: number;
  pointBackValidity: number;
  offerLimit: number;
  upToLimit: number;
  paymentAmountValidity: number;
  basicInfo: {
    vatPercentage: number;
    applicationPoints: {
      vatPercentage: number;
      current: number; // pointBackRatio1
      total: number; // srRatio1
    };
  };
  displaySettings: {
    latestOffers: number; // numberOfLatestOffersOnHomepage1
    bestSellingBrands: number; // numberOfProductsOnHomepage
    newArrivals: number; // numberOfNewArrivalsOnHomepage1
  };
  // Backward compatibility fields
  latestOffers: number;
  bestSellingBrands: number;
  newArrivals: number;
}

interface Props {
  settings: SettingsData;
}

export function SettingsDetails({ settings }: Readonly<Props>) {
  const [loading, setLoading] = useState(false);
  const { token } = useAppContext();
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [settingsFormData, setSettingsFormData] = useState({
    vat: 5,
    loginAttemptDurationMinutes: 20,
    loginAttempts: 5,
    permanentDelete: false,
    loginAsGuest: false,
    numberOfProductsOnHomepage: 3,
    numberOfFeaturedProductsOnHomepage: 10,
    numberOfCategoriesOnHomepage: 3,
    numberOfLatestOffersOnHomepage: 3,
    numberOfNewArrivalsOnHomepage: 3,
  });

  // Initialize form data from props instead of fetching from API
  useEffect(() => {
    setSettingsFormData({
      vat: settings.basicInfo.vatPercentage ?? 5,
      loginAttemptDurationMinutes: settings.loginAttemptDurationMinutes ?? 20,
      loginAttempts: settings.loginAttempts ?? 5,
      permanentDelete: settings.permanentDelete ?? false,
      loginAsGuest: settings.loginAsGuest ?? false,
      numberOfProductsOnHomepage: settings.numberOfProductsOnHomepage ?? 3,
      numberOfFeaturedProductsOnHomepage:
        settings.numberOfFeaturedProductsOnHomepage ?? 10,
      numberOfCategoriesOnHomepage: settings.numberOfCategoriesOnHomepage ?? 3,
      numberOfLatestOffersOnHomepage:
        settings.numberOfLatestOffersOnHomepage ?? 3,
      numberOfNewArrivalsOnHomepage:
        settings.numberOfNewArrivalsOnHomepage ?? 3,
    });
  }, [settings]);

  const handleSettingsSubmit = async () => {
    try {
      setLoading(true);

      await axios.put(
        `/api/app-settings`,
        {
          vat: parseInt(settingsFormData.vat.toString()),
          numberOfLatestOffersOnHomepage: parseInt(
            settingsFormData.numberOfLatestOffersOnHomepage.toString()
          ),
          numberOfProductsOnHomepage: parseInt(
            settingsFormData.numberOfProductsOnHomepage.toString()
          ),
          numberOfFeaturedProductsOnHomepage: parseInt(
            settingsFormData.numberOfFeaturedProductsOnHomepage.toString()
          ),
          numberOfNewArrivalsOnHomepage: parseInt(
            settingsFormData.numberOfNewArrivalsOnHomepage.toString()
          ),
          loginAttemptDurationMinutes: parseInt(
            settingsFormData.loginAttemptDurationMinutes.toString()
          ),
          loginAttempts: parseInt(settingsFormData.loginAttempts.toString()),
          numberOfCategoriesOnHomepage: parseInt(
            settingsFormData.numberOfCategoriesOnHomepage.toString()
          ),
          permanentDelete: settingsFormData.permanentDelete,
          loginAsGuest: settingsFormData.loginAsGuest,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept-language": locale,
          },
        }
      );

      toast.success(t("settingsUpdated"));
      setIsEditing(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("error.failedToUpdateSettings")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setSettingsFormData({
      vat: settings.basicInfo.vatPercentage ?? 5,
      loginAttemptDurationMinutes: settings.loginAttemptDurationMinutes ?? 20,
      loginAttempts: settings.loginAttempts ?? 5,
      permanentDelete: settings.permanentDelete ?? false,
      loginAsGuest: settings.loginAsGuest ?? false,
      numberOfProductsOnHomepage: settings.numberOfProductsOnHomepage ?? 3,
      numberOfFeaturedProductsOnHomepage:
        settings.numberOfFeaturedProductsOnHomepage ?? 10,
      numberOfCategoriesOnHomepage: settings.numberOfCategoriesOnHomepage ?? 3,
      numberOfLatestOffersOnHomepage:
        settings.numberOfLatestOffersOnHomepage ?? 3,
      numberOfNewArrivalsOnHomepage:
        settings.numberOfNewArrivalsOnHomepage ?? 3,
    });
  };

  return (
    <div className="bg-[#f1f1f1] rounded-2xl shadow-xl drop-shadow-2xl p-6">
      <SettingsHeader
        isEditing={isEditing}
        loading={loading}
        onEditToggle={handleEditToggle}
        onCancel={handleCancel}
        onSave={handleSettingsSubmit}
      />

      <SectionWrapper title={t("basicinformation")}>
        <BasicInfoSection
          isEditing={isEditing}
          settingsFormData={settingsFormData}
          onSettingsChange={setSettingsFormData}
        />
      </SectionWrapper>

      <SectionWrapper title={t("displaysettings")}>
        <DisplaySettingsSection
          isEditing={isEditing}
          settingsFormData={settingsFormData}
          onSettingsChange={setSettingsFormData}
        />
      </SectionWrapper>
    </div>
  );
}
