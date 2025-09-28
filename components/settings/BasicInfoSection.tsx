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

  const handleInputChange = (field: string, value: number | boolean) => {
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
    </div>
  );
}
