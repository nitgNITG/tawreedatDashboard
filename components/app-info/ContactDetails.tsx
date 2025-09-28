"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ChevronDown,
} from "lucide-react";
import {
  TiktokIcon,
  WhatsappIcon,
  TelegramIcon,
  PinterestIcon,
  SnapchatIcon,
  RedditIcon,
} from "@/components/icons";

interface SocialMediaData {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  telegram: string | null;
  snapchat: string | null;
  pinterest: string | null;
  reddit: string | null;
}

interface ContactData {
  email: string;
  phone: string;
  location?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  snapchat?: string;
  pinterest?: string;
  reddit?: string;
}

const ContactDetails = ({ contactData }: { contactData: ContactData }) => {
  const t = useTranslations("appInfo");
  const { token } = useAppContext();
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const [socialMedia, setSocialMedia] = useState<SocialMediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    phone: "",
    email: "",
  });
  const [editedContactFields, setEditedContactFields] = useState<Set<string>>(
    new Set()
  );
  const [phoneError, setPhoneError] = useState("");

  // Update socialIcons object
  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    tiktok: TiktokIcon,
    youtube: Youtube,
    pinterest: PinterestIcon,
    snapchat: SnapchatIcon,
    whatsapp: WhatsappIcon,
    telegram: TelegramIcon,
    reddit: RedditIcon,
  };

  // Initialize data from props
  useEffect(() => {
    setContactForm({
      phone: contactData.phone || "",
      email: contactData.email || "",
    });

    setSocialMedia({
      facebook: contactData.facebook || null,
      twitter: contactData.twitter || null,
      instagram: contactData.instagram || null,
      linkedin: contactData.linkedin || null,
      youtube: contactData.youtube || null,
      tiktok: contactData.tiktok || null,
      whatsapp: contactData.whatsapp || null,
      telegram: contactData.telegram || null,
      snapchat: contactData.snapchat || null,
      pinterest: contactData.pinterest || null,
      reddit: contactData.reddit || null,
    });

    setLoading(false);
  }, [contactData]);

  // Unified update function
  const updateData = async (updates: Record<string, string | null>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/app-data`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
          redirect: "follow",
        }
      );

      if (!response.ok) throw new Error("Failed to update data");
      return true;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSocialMediaChange = (
    platform: keyof SocialMediaData,
    value: string
  ) => {
    if (!socialMedia) return;
    setSocialMedia((prev) => (prev ? { ...prev, [platform]: value } : null));
    setEditedFields((prev) => new Set(prev).add(platform));
  };

  const updateSocialMedia = async (platform: string) => {
    try {
      await updateData({
        [platform]: socialMedia?.[platform as keyof SocialMediaData] || null,
      });

      toast.success(`Updated ${platform} successfully`);
      setEditedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    } catch (error) {
      console.error("Error updating social media:", error);
      toast.error(`Failed to update ${platform}: make sure it is a valid url`);
    }
  };

  const updateAllSocialMedia = async () => {
    try {
      const updates = Array.from(editedFields).reduce(
        (acc, platform) => ({
          ...acc,
          [platform]: socialMedia?.[platform as keyof SocialMediaData] || null,
        }),
        {}
      );

      await updateData(updates);
      toast.success("All social media updated successfully");
      setEditedFields(new Set());
    } catch (error) {
      console.error("Error updating all social media:", error);
      toast.error("Failed to update social media");
    }
  };

  const validatePhone = (phone: string) => {
    if (!phone.startsWith("+")) {
      return t("phoneError.startPlus");
    }
    return "";
  };

  const handleContactChange = (field: "phone" | "email", value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
    setEditedContactFields((prev) => new Set(prev).add(field));

    if (field === "phone") {
      setPhoneError(validatePhone(value));
    }
  };

  const updateContactInfo = async () => {
    try {
      if (phoneError) {
        toast.error("Please fix phone number format");
        return;
      }

      const updates: Record<string, string> = {};
      if (editedContactFields.has("phone")) {
        updates.phone = contactForm.phone;
      }
      if (editedContactFields.has("email")) {
        updates.email = contactForm.email;
      }

      await updateData(updates);
      toast.success("Contact information updated successfully");
      setEditedContactFields(new Set());
    } catch (error) {
      console.error("Error updating contact information:", error);
      toast.error("Failed to update contact information");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-[32px] shadow-lg overflow-hidden">
        <button
          onClick={() => setIsContactExpanded(!isContactExpanded)}
          className={cn(
            "w-full px-6 py-4 flex items-center justify-between",
            "bg-[#241234] transition-colors duration-200"
          )}
        >
          <h2 className="text-lg font-semibold text-white">
            {t("contactInformation")}
          </h2>
          <ChevronDown
            className={cn(
              "size-5 text-primary transition-transform duration-200",
              isContactExpanded && "transform rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            isContactExpanded
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="p-6 space-y-6">
            {/* Contact Information Form */}
            <form className="space-y-4">
              <div className="flex gap-4 items-center">
                <label className="w-24 text-sm text-gray-700">
                  {t("phone")} :
                </label>
                <div className="flex-1">
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      handleContactChange("phone", e.target.value)
                    }
                    placeholder="+201022537399"
                    className={cn(
                      "w-full px-4 py-2 text-sm rounded-[32px]",
                      "bg-[#D4CFD6] hover:bg-[#D4CFD6]/80 border",
                      phoneError ? "border-red-500" : "border-gray-200",
                      "text-gray-700 placeholder:text-gray-400"
                    )}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <label className="w-24 text-sm text-gray-700">
                  {t("email")} :
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="brand1293@gmail.com"
                  className={cn(
                    "flex-1 px-4 py-2 text-sm rounded-[32px]",
                    "bg-[#D4CFD6] hover:bg-[#D4CFD6]/80 border border-gray-200",
                    "text-gray-700 placeholder:text-gray-400"
                  )}
                />
              </div>

              {editedContactFields.size > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={updateContactInfo}
                    disabled={!!phoneError}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-[32px]",
                      "transition-colors duration-200",
                      phoneError
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/80 text-white"
                    )}
                  >
                    {t("saveChanges")}
                  </button>
                </div>
              )}
            </form>

            {/* Social Media Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-700">
                  {t("socialMediaAccounts")}
                </h3>
                {editedFields.size > 0 && (
                  <button
                    onClick={updateAllSocialMedia}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-[32px]",
                      "bg-primary text-white",
                      "hover:bg-primary/80 transition-colors duration-200"
                    )}
                  >
                    {t("saveAllChanges")}
                  </button>
                )}
              </div>
              {loading ? (
                <div className="text-center py-4 text-gray-600">
                  {t("loading")}
                </div>
              ) : (
                <div className="space-y-3">
                  {socialMedia &&
                    Object.entries(socialIcons).map(([platform, Icon]) => (
                      <div key={platform} className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <input
                          type="url"
                          placeholder={t("enterUrl", { platform })}
                          value={
                            socialMedia[platform as keyof SocialMediaData] || ""
                          }
                          onChange={(e) =>
                            handleSocialMediaChange(
                              platform as keyof SocialMediaData,
                              e.target.value
                            )
                          }
                          className={cn(
                            "flex-1 px-4 py-2 text-sm rounded-[32px]",
                            "bg-[#D4CFD6] hover:bg-[#D4CFD6]/80 border border-gray-200",
                            "text-gray-700 placeholder:text-gray-400"
                          )}
                        />
                        {editedFields.has(platform) && (
                          <button
                            onClick={() => updateSocialMedia(platform)}
                            className={cn(
                              "px-3 py-2 text-sm rounded-[32px]",
                              "bg-primary text-white",
                              "hover:bg-primary/80 transition-colors duration-200"
                            )}
                          >
                            {t("saveChanges")}
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
