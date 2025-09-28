"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const ChangeLanguage = () => {
  const pathname = usePathname();
  const getNewPathname = (newLocale: string) => {
    let newPathname = pathname.replace(/^\/(en|ar)/, "");
    return `/${newLocale}${newPathname}`;
  };
  return (
    <div className="pb-5 flex justify-between text-secondary">
      <Link className="underline" href={getNewPathname("en")}>
        English
      </Link>
      <Link className="underline" href={getNewPathname("ar")}>
        العربي
      </Link>
    </div>
  );
};

export default ChangeLanguage;
