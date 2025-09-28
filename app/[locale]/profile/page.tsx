import ProfileForm from "@/components/profile/ProfileForm";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("profile");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
            <h1 className="text-3xl font-bold">{t("profileSettings")}</h1>
            <p className="mt-2 opacity-90">{t("manageAccount")}</p>
          </div>

          <div className="p-6">
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
