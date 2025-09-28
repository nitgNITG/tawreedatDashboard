import { Suspense } from "react";
import TranslationKeysSelector from "./TranslationKeysSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Server component to fetch translation keys
async function getTranslationKeys() {
  try {
    // For server-side fetching, we need to use absolute URL
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/translations?keys=true`, {
      cache: "no-store", // Always fetch fresh data
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch translation keys:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();
    return data.keys || [];
  } catch (error) {
    console.error("Error fetching translation keys:", error);
    return [];
  }
}

function LoadingKeys() {
  return (
    <div className="animate-pulse">
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default async function TranslationsPage() {
  const keys = await getTranslationKeys();
  const t = await getTranslations("translations");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Languages className="size-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold">
                  {t("title")}
                </CardTitle>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<LoadingKeys />}>
              <TranslationKeysSelector keys={keys} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
