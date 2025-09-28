"use client";
import { useTranslations } from "next-intl";

interface DisplaySettingsSectionProps {
  isEditing: boolean;
  settingsFormData: {
    numberOfProductsOnHomepage: number;
    numberOfFeaturedProductsOnHomepage: number;
    numberOfCategoriesOnHomepage: number;
    numberOfLatestOffersOnHomepage: number;
    numberOfNewArrivalsOnHomepage: number;
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

export function DisplaySettingsSection({
  isEditing,
  settingsFormData,
  onSettingsChange,
}: Readonly<DisplaySettingsSectionProps>) {
  const t = useTranslations("settings");

  const handleInputChange = (field: string, value: number) => {
    onSettingsChange({
      ...settingsFormData,
      [field]: value,
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-gray-700">
            {t("numberOfProductsOnHomepage")}
          </label>
          <input
            type="number"
            value={settingsFormData.numberOfProductsOnHomepage}
            onChange={(e) =>
              handleInputChange(
                "numberOfProductsOnHomepage",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
            min="0"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">
            {t("numberOfCategoriesOnHomepage")}
          </label>
          <input
            type="number"
            value={settingsFormData.numberOfCategoriesOnHomepage}
            onChange={(e) =>
              handleInputChange(
                "numberOfCategoriesOnHomepage",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
            min="0"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">
            {t("numberOfFeaturedProductsOnHomepage")}
          </label>
          <input
            type="number"
            value={settingsFormData.numberOfFeaturedProductsOnHomepage}
            onChange={(e) =>
              handleInputChange(
                "numberOfFeaturedProductsOnHomepage",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
            min="0"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("numberOfLatestOffers")}</label>
          <input
            type="number"
            value={settingsFormData.numberOfLatestOffersOnHomepage}
            onChange={(e) =>
              handleInputChange(
                "numberOfLatestOffersOnHomepage",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
            min="0"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">{t("numberOfNewArrivals")}</label>
          <input
            type="number"
            value={settingsFormData.numberOfNewArrivalsOnHomepage}
            onChange={(e) =>
              handleInputChange(
                "numberOfNewArrivalsOnHomepage",
                Number(e.target.value)
              )
            }
            className="px-3 py-2 border rounded-md w-48"
            min="0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InfoRow
        label={t("numberOfProductsOnHomepage")}
        value={(settingsFormData.numberOfProductsOnHomepage ?? 3).toString()}
      />
      <InfoRow
        label={t("numberOfCategoriesOnHomepage")}
        value={(settingsFormData.numberOfCategoriesOnHomepage ?? 3).toString()}
      />
      <InfoRow
        label={t("numberOfFeaturedProductsOnHomepage")}
        value={(
          settingsFormData.numberOfFeaturedProductsOnHomepage ?? 10
        ).toString()}
      />
      <InfoRow
        label={t("numberOfLatestOffers")}
        value={settingsFormData.numberOfLatestOffersOnHomepage.toString()}
      />
      <InfoRow
        label={t("numberOfNewArrivals")}
        value={settingsFormData.numberOfNewArrivalsOnHomepage.toString()}
      />
    </div>
  );
}
