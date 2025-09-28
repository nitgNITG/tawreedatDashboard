"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const usePushQuery = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushQuery = (key: string, term: string, scroll: boolean = false) => {
    // Create a new URLSearchParams object from the current params
    const params = new URLSearchParams(searchParams.toString());

    // Handle clearing all filters
    if (key === "clear") {
      // Get all param keys except pagination ones we want to keep
      const keys = Array.from(params.keys()).filter(
        (k) => k !== "page" && k !== "limit"
      );

      // Delete each key
      keys.forEach((k) => params.delete(k));
    }
    // Handle empty term (removal of filter)
    else if (!term) {
      params.delete(key);

      // Also handle special case for bracket notation like 'parentId[not]'
      if (key.includes("[") && key.includes("]")) {
        // Extract the base key name (e.g., 'parentId' from 'parentId[not]')
        const baseKey = key.split("[")[0];
        // Delete any parameters that start with this base key
        Array.from(params.keys())
          .filter((k) => k.startsWith(baseKey + "["))
          .forEach((k) => params.delete(k));
      }

      // And handle the inverse - if we're deleting a base key, also delete any bracket variants
      else {
        Array.from(params.keys())
          .filter((k) => k.startsWith(key + "["))
          .forEach((k) => params.delete(k));
      }
    }
    // Handle setting a new filter
    else {
      // If this is a special key with brackets (like parentId[not])
      if (key.includes("[") && key.includes("]")) {
        // Delete the base key if it exists (e.g., delete 'parentId' when adding 'parentId[not]')
        const baseKey = key.split("[")[0];
        params.delete(baseKey);
      }
      // If this is a base key, delete any bracket variants
      else {
        Array.from(params.keys())
          .filter((k) => k.startsWith(key + "["))
          .forEach((k) => params.delete(k));
      }

      // Set the new parameter
      params.set(key, term);
    }
    // Reset to skip 0 when filters change
    if (key !== "skip" && key !== "limit" && params.has("skip")) {
      params.set("skip", "0");
    }
    // Navigate to the new URL
    router.push(`${pathname}?${params.toString()}`, { scroll });
  };

  return pushQuery;
};

export default usePushQuery;
