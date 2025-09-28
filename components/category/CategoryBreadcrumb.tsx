"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import React from "react";

interface CategoryBreadcrumbProps {
  categoryPath?: string[]; // Array of category names in the path
  currentCategory?: string; // The current category name (with spaces)
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

const CategoryBreadcrumb = ({
  categoryPath,
  currentCategory,
}: CategoryBreadcrumbProps) => {
  const t = useTranslations("category");

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Always start with Categories home
  breadcrumbItems.push({
    label: t("categories"),
    href: "/categories",
    isActive: false,
  });

  // Add each category in the path
  if (categoryPath && categoryPath.length > 0) {
    categoryPath.forEach((category, index) => {
      const isLast = index === categoryPath.length - 1;
      const pathUpToHere = categoryPath.slice(0, index + 1);
      const href = `/categories/${pathUpToHere
        .map((cat) => cat.replace(/ /g, "-"))
        .join("/")}`;

      breadcrumbItems.push({
        label: category,
        href: href,
        isActive: isLast,
      });
    });
  }

  // Don't show breadcrumb if we're just on the main categories page
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`${item.href}-${index}`}>
            <BreadcrumbItem>
              {item.isActive ? (
                <BreadcrumbPage className="text-primary font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CategoryBreadcrumb;