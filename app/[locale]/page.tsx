import Dashboard from "@/components/Dashboard/Dashboard";
import { DashboardStats } from "@/types/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
}

async function fetchDashboardData(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return { data: null, error: "No token provided" };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { data: null, error: await res.text() };
    }

    const data = await res.json();

    return {
      data,
      error: null,
    };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error?.message };
  }
}

export default async function Page({
  params: { locale },
}: Readonly<{
  params: { locale: string };
}>) {
  const token = cookies().get("token")?.value;

  // Check if user is brand representative and redirect them
  if (token) {
    try {
      const secret = process.env.SECRET_KEY ?? "default_secret_key";
      const secretKey = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, secretKey);
      const decoded = payload as unknown as DecodedToken;

      if (decoded.role === "brand representative") {
        redirect(`/${locale}/brands`);
      }
    } catch (error) {
      console.error("Token verification failed in dashboard:", error);
      // Token is invalid, let layout handle showing login
    }
  }

  const { data, error } = await fetchDashboardData();

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div className="text-red-500">No data available</div>;

  return (
    <div className="p-container">
      <Dashboard data={data} />
    </div>
  );
}
