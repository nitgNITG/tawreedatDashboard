export type SocialMediaPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "telegram";

export interface SocialMedia {
  id: number;
  brandId: number;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  whatsapp: string | null;
  telegram: string | null;
}

// Add type definition for admin statuses
export type BrandStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED"
  | "ADMINACTIVE"
  | "ADMININACTIVE";

export interface Brand {
  id: number;
  name: string;
  phone: string;
  email: string;
  url: string;
  logo: string;
  cover: string;
  about: string;
  pointBackTerms: string;
  address: string;
  validFrom: string;
  validTo: string;
  ratio: number;
  pointBackRatio: number;
  status: BrandStatus;
  purchaseCount?: number;
  validityPeriod?: number;
  pointBackUpTo?: number;
  discountUpTo?: number;
  description?: string;
  city?: string;
  country?: string;
  website?: string;
  appPercentage?: number;
  supplierPercentage?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  BrandToken?: {
    token: string;
    expired: boolean;
  };
}
