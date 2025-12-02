import AddAds from "@/components/ads/AddAds";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
const page = async () => {
  const locale = (await getLocale()) as "en" | "ar";
  return (
    <div className="p-container space-y-10 pb-5">
      <AddAds
        handleClose={async () => {
          "use server";
          redirect({ href: "/ads", locale });
        }}
      />
    </div>
  );
};

export default page;
