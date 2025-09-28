import { headers } from "next/headers";

const UsePathnameServer = () => {
  const headersList = headers();
  const domain = headersList.get("host") || "";
  const fullUrl = headersList.get("referer") || "";
  const [, pathname] =
    fullUrl.match(new RegExp(`https?:\/\/${domain}(.*)`)) || [];
  return pathname;
};
export default UsePathnameServer;
