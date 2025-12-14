"use client";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";

interface BasicInfoSectionProps {
  isEditing: boolean;
  settingsFormData: {
    vat: number;
    loginAttemptDurationMinutes: number;
    loginAttempts: number;
    permanentDelete: boolean;
    loginAsGuest: boolean;
    app_android_version: string;
    app_android_url: string;
    app_ios_version: string;
    app_ios_url: string;
    paymob_api_key: string;
    paymob_secret_key: string;
    paymob_public_key: string;
    paymob_base_url: string;
    paymob_payment_methods: string;
  };
  onSettingsChange: (newSettings: any) => void;
}

interface InfoRowProps {
  label: string;
  value: string;
  color?: string;
}

function InfoRow({ label, value, color }: Readonly<InfoRowProps>) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      <Pill color={color} text={value} />
    </div>
  );
}

function Pill({ text, color }: Readonly<{ text: string; color?: string }>) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm bg-[#f3f4f6]`}
      style={{
        backgroundColor: color ? `${color}20` : "#f3f4f6",
        color: color ?? "#374151",
      }}
    >
      {text}
    </span>
  );
}

export function BasicInfoSection({
  isEditing,
  settingsFormData,
  onSettingsChange,
}: Readonly<BasicInfoSectionProps>) {
  const t = useTranslations("settings");

  const handleInputChange = (
    field: string,
    value: number | boolean | string
  ) => {
    onSettingsChange({
      ...settingsFormData,
      [field]: value,
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("vatPercentage")}</label>
          <input
            type="number"
            value={settingsFormData.vat}
            onChange={(e) => handleInputChange("vat", Number(e.target.value))}
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("loginAttemptDuration")}</label>
          <input
            type="number"
            value={settingsFormData.loginAttemptDurationMinutes}
            onChange={(e) =>
              handleInputChange(
                "loginAttemptDurationMinutes",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("loginAttempts")}</label>
          <input
            type="number"
            value={settingsFormData.loginAttempts}
            onChange={(e) =>
              handleInputChange("loginAttempts", Number(e.target.value))
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("permanentDelete")}</label>
          <Switch
            checked={settingsFormData.permanentDelete}
            onCheckedChange={(value) =>
              handleInputChange("permanentDelete", value)
            }
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("loginAsGuest")}</label>
          <Switch
            checked={settingsFormData.loginAsGuest}
            onCheckedChange={(value) =>
              handleInputChange("loginAsGuest", value)
            }
          />
        </div>
        {/* App Android Version */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("app_android_version")}</label>
          <input
            type="text"
            value={settingsFormData.app_android_version}
            onChange={(e) =>
              handleInputChange("app_android_version", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* App Android URL */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("app_android_url")}</label>
          <input
            type="text"
            value={settingsFormData.app_android_url}
            onChange={(e) =>
              handleInputChange("app_android_url", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* App iOS Version */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("app_ios_version")}</label>
          <input
            type="text"
            value={settingsFormData.app_ios_version}
            onChange={(e) =>
              handleInputChange("app_ios_version", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* App iOS URL */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("app_ios_url")}</label>
          <input
            type="text"
            value={settingsFormData.app_ios_url}
            onChange={(e) => handleInputChange("app_ios_url", e.target.value)}
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>
        {/* Paymob API Key */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("paymob_api_key")}</label>
          <input
            type="text"
            value={settingsFormData.paymob_api_key}
            onChange={(e) =>
              handleInputChange("paymob_api_key", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* Paymob Secret Key */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("paymob_secret_key")}</label>
          <input
            type="text"
            value={settingsFormData.paymob_secret_key}
            onChange={(e) =>
              handleInputChange("paymob_secret_key", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* Paymob Public Key */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("paymob_public_key")}</label>
          <input
            type="text"
            value={settingsFormData.paymob_public_key}
            onChange={(e) =>
              handleInputChange("paymob_public_key", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* Paymob Base URL */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("paymob_base_url")}</label>
          <input
            type="text"
            value={settingsFormData.paymob_base_url}
            onChange={(e) =>
              handleInputChange("paymob_base_url", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>

        {/* Paymob Payment Methods */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("paymob_payment_methods")}</label>
          <input
            type="text"
            value={settingsFormData.paymob_payment_methods}
            onChange={(e) =>
              handleInputChange("paymob_payment_methods", e.target.value)
            }
            className="px-3 py-2 border rounded-md w-48"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InfoRow label={t("vatPercentage")} value={`${settingsFormData.vat}%`} />
      <InfoRow
        label={t("loginAttemptDuration")}
        value={settingsFormData.loginAttemptDurationMinutes.toString()}
      />
      <InfoRow
        label={t("loginAttempts")}
        value={settingsFormData.loginAttempts.toString()}
      />

      <InfoRow
        label={t("permanentDelete")}
        value={settingsFormData.permanentDelete ? t("on") : t("off")}
        color={settingsFormData.permanentDelete ? "#10b981" : "#ef4444"}
      />
      <InfoRow
        label={t("loginAsGuest")}
        value={settingsFormData.loginAsGuest ? t("on") : t("off")}
        color={settingsFormData.loginAsGuest ? "#10b981" : "#ef4444"}
      />
      <InfoRow
        label={t("app_android_version")}
        value={settingsFormData.app_android_version}
      />
      <InfoRow
        label={t("app_android_url")}
        value={settingsFormData.app_android_url}
      />
      <InfoRow
        label={t("app_ios_version")}
        value={settingsFormData.app_ios_version}
      />
      <InfoRow label={t("app_ios_url")} value={settingsFormData.app_ios_url} />
      <InfoRow
        label={t("paymob_api_key")}
        value={settingsFormData.paymob_api_key}
      />
      <InfoRow
        label={t("paymob_secret_key")}
        value={settingsFormData.paymob_secret_key}
      />
      <InfoRow
        label={t("paymob_public_key")}
        value={settingsFormData.paymob_public_key}
      />
      <InfoRow
        label={t("paymob_base_url")}
        value={settingsFormData.paymob_base_url}
      />
      <InfoRow
        label={t("paymob_payment_methods")}
        value={settingsFormData.paymob_payment_methods}
      />
    </div>
  );
}
