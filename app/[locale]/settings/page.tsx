import axios from "axios";
import { SettingsDetails } from "@/components/settings/SettingsDetails";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

export default async function SettingsPage() {
  const token = cookies().get("token")?.value;
  const locale = await getLocale();

  // Fetch settings data
  const settingsData = await fetchSettings(token, locale);

  // Transform API data to match component structure and Prisma model
  const formattedData = {
    numberOfProductsOnHomepage: settingsData.numberOfProductsOnHomepage ?? 3,
    numberOfFeaturedProductsOnHomepage:
      settingsData.numberOfFeaturedProductsOnHomepage ?? 10,
    numberOfCategoriesOnHomepage:
      settingsData.numberOfCategoriesOnHomepage ?? 3,
    numberOfLatestOffersOnHomepage:
      settingsData.numberOfLatestOffersOnHomepage ?? 3,
    numberOfNewArrivalsOnHomepage:
      settingsData.numberOfNewArrivalsOnHomepage ?? 3,
    loginAttemptDurationMinutes: settingsData.loginAttemptDurationMinutes ?? 20,
    loginAttempts: settingsData.loginAttempts ?? 5,
    permanentDelete: settingsData.permanentDelete ?? false,
    loginAsGuest: settingsData.loginAsGuest ?? false,
    vat: settingsData.vat ?? 5,
    pointBackValidity: settingsData.pointBackValidity ?? 0,
    offerLimit: settingsData.offerLimit ?? 0,
    upToLimit: settingsData.upToLimit ?? 0,
    paymentAmountValidity: settingsData.paymentAmountValidity ?? 0,
    basicInfo: {
      vatPercentage: settingsData.vat ?? 5,
      applicationPoints: {
        vatPercentage: settingsData.vat ?? 5,
        current: settingsData.pointBackRatio ?? 0,
        total: settingsData.srRatio ?? 0,
      },
    },
    displaySettings: {
      latestOffers: settingsData.numberOfLatestOffersOnHomepage ?? 3,
      bestSellingBrands: settingsData.numberOfProductsOnHomepage ?? 3,
      newArrivals: settingsData.numberOfNewArrivalsOnHomepage ?? 3,
    },
    // Keep backward compatibility fields
    latestOffers: settingsData.numberOfLatestOffersOnHomepage ?? 3,
    bestSellingBrands: settingsData.numberOfProductsOnHomepage ?? 3,
    newArrivals: settingsData.numberOfNewArrivalsOnHomepage ?? 3,
    classificationPolicy: [],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SettingsDetails settings={formattedData} />
    </div>
  );
}

async function fetchSettings(token: string | undefined, locale: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/app-settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "accept-language": locale,
        },
      }
    );
    console.log("Settings response:", response.data);

    return response.data.settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return default values matching Prisma model defaults
    return {
      numberOfProductsOnHomepage: 3,
      numberOfFeaturedProductsOnHomepage: 10,
      numberOfCategoriesOnHomepage: 3,
      numberOfLatestOffersOnHomepage: 3,
      numberOfNewArrivalsOnHomepage: 3,
      loginAttemptDurationMinutes: 20,
      loginAttempts: 5,
      permanentDelete: false,
      loginAsGuest: false,
      vat: 5,
    };
  }
}
