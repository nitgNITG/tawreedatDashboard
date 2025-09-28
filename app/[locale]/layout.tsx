import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import ProviderApp from "@/context/appContext";
import { cookies } from "next/headers";
import ReduxProvider from "@/redux/ReduxProvider";
import Login from "@/components/Login/Login";
import { User } from "@/redux/reducers/usersReducer";
import NotificationHandler from "@/components/notifications/NotificationHandler";
import { fetchData } from "@/lib/fetchData";

export const metadata: Metadata = {
  title: "library App",
  description: "investment payback app",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();
  const token = cookies().get("token")?.value;

  const fetchUser = async () => {
    try {
      if (!token) {
        console.log("No token found");
        return { data: null, error: "token is required" };
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Add content type header
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Verification Error:", errorText);
        return { data: null, error: errorText };
      }

      const data = await res.json();

      // Add explicit check for user data
      if (!data.user) {
        console.log("No user data in response");
        return { data: null, error: "No user data" };
      }

      if (data.user.role !== "ADMIN") {
        return { data: null, error: "No user data" };
      }

      return { data: data, error: null };
    } catch (error: any) {
      console.error("Verification Error:", error);
      return { data: null, error: error?.message };
    }
  };
  const { data } = (await fetchUser()) as { data: { user: User }; error: any };
  const notification = await fetchData(`/api/users/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!notification.data) {
    console.error("Failed to fetch notifications:", notification.error);
  }

  if (!notification.data) {
    console.error("Failed to fetch notifications:", notification.error);
  }

  return (
    <html lang={locale} dir={locale == "ar" ? "rtl" : "ltr"}>
      <body className={`antialiased bg-[#f0f2f5]`}>
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            {data?.user ? (
              <ProviderApp user={data?.user} token={token as string}>
                {children}
                <NotificationHandler
                  notifications={notification.data?.userNotifications ?? []}
                  totalNotifications={
                    notification.data?.totalUserNotifications ?? 0
                  }
                  totalPages={notification.data?.totalPages ?? 0}
                  unreadCount={notification.data?.totalUnreadNotifications ?? 0}
                />
              </ProviderApp>
            ) : (
              <Login />
            )}
          </ReduxProvider>
          <Toaster
            toastOptions={{
              duration: 4000,
              position: "bottom-right",
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
