import AppInfoDetails from "@/components/app-info/AppInfoDetails";
import ContactDetails from "@/components/app-info/ContactDetails";
import { getLocale } from "next-intl/server";

export interface AppData {
  about: string;
  aboutAr: string;
  mission: string;
  missionAr: string;
  vision: string;
  visionAr: string;
  privacy_policy: string;
  privacy_policyAr: string;
  terms: string;
  termsAr: string;
  digitalCard: string;
  digitalCardAr: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  snapchat?: string;
  pinterest?: string;
  reddit?: string;
}

const AboutAppPage = async () => {
  const lang = await getLocale();
  const fetchData = async (): Promise<{
    data?: { appData: AppData; message: string };
    error: string | null;
  }> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/app-data`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
          },
        }
      );
      const result = await response.json();
      console.log(result);
      
      return { data: result, error: null };
    } catch (error) {
      console.error(error);
      return {
        data: undefined,
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message || "Unknown error"
            : "Unknown error",
      };
    }
  };

  const { data, error } = await fetchData();

  if (!data) return <div>Loading...</div>;
  if (!data.appData) return <div>No app data available</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  const appData = data?.appData;

  const appInfo = {
    about: appData.about,
    aboutAr: appData.aboutAr,
    mission: appData.mission,
    missionAr: appData.missionAr,
    vision: appData.vision,
    visionAr: appData.visionAr,
    privacy_policy: appData.privacy_policy,
    privacy_policyAr: appData.privacy_policyAr,
    terms: appData.terms,
    termsAr: appData.termsAr,
    digitalCard: appData.digitalCard,
    digitalCardAr: appData.digitalCardAr,
  };

  const contactInfo = {
    email: appData.email || "",
    phone: appData.phone || "",
    brandUrl: appData.url || "",
    location: appData.address || "",
    facebook: appData.facebook,
    twitter: appData.twitter,
    instagram: appData.instagram,
    linkedin: appData.linkedin,
    youtube: appData.youtube,
    tiktok: appData.tiktok,
    whatsapp: appData.whatsapp,
    telegram: appData.telegram,
    snapchat: appData.snapchat,
    pinterest: appData.pinterest,
    reddit: appData.reddit,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <AppInfoDetails data={appInfo} />
      <ContactDetails contactData={contactInfo} />
    </div>
  );
};

export default AboutAppPage;
