"use client";
import { useTranslations } from "next-intl";

interface SettingsHeaderProps {
  isEditing: boolean;
  loading: boolean;
  onEditToggle: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function SettingsHeader({ isEditing, loading, onEditToggle, onCancel, onSave }: SettingsHeaderProps) {
  const t = useTranslations("settings");

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
      <div className="flex items-center space-x-4">
        {!isEditing ? (
          <button
            type="button"
            onClick={onEditToggle}
            className="text-primary hover:text-primary/800 transition-colors"
          >
            {t("edit")}
          </button>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
              disabled={loading}
            >
              {loading ? t("saving") : t("save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
