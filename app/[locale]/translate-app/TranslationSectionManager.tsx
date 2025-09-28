"use client";
import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Save,
  Plus,
  Trash2,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface FlattenedTranslation {
  key: string;
  en: string;
  ar: string;
}

interface TranslationSectionManagerProps {
  section: string;
  onBack: () => void;
}

export default function TranslationSectionManager({
  section,
  onBack,
}: Readonly<TranslationSectionManagerProps>) {
  const t = useTranslations("translations");
  const locale = useLocale() as "en" | "ar";
  const [sectionData, setSectionData] = useState<{
    en: TranslationData;
    ar: TranslationData;
  }>({ en: {}, ar: {} });

  const [flattenedTranslations, setFlattenedTranslations] = useState<
    FlattenedTranslation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValueEn, setNewValueEn] = useState("");
  const [newValueAr, setNewValueAr] = useState("");

  // Load section data on component mount
  useEffect(() => {
    loadSectionData();
  }, [section]);

  const loadSectionData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/translations?section=${section}`);
      const data = await response.json();
      setSectionData({ en: data.en, ar: data.ar });
      setFlattenedTranslations(
        flattenSectionTranslations({ en: data.en, ar: data.ar })
      );
    } catch (error) {
      toast.error(t("errors.loading", { section }));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const flattenSectionTranslations = (data: {
    en: TranslationData;
    ar: TranslationData;
  }): FlattenedTranslation[] => {
    const flattenObject = (
      obj: TranslationData,
      prefix = ""
    ): { [key: string]: string } => {
      let result: { [key: string]: string } = {};

      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "string") {
          result[newKey] = value;
        } else if (typeof value === "object" && value !== null) {
          result = { ...result, ...flattenObject(value, newKey) };
        }
      }

      return result;
    };

    const flatEn = flattenObject(data.en);
    const flatAr = flattenObject(data.ar);

    const allKeys = new Set([...Object.keys(flatEn), ...Object.keys(flatAr)]);

    return Array.from(allKeys).map((key) => ({
      key,
      en: flatEn[key] || "",
      ar: flatAr[key] || "",
    }));
  };

  const handleTranslationChange = (
    key: string,
    locale: "en" | "ar",
    value: string
  ) => {
    setFlattenedTranslations((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [locale]: value } : item
      )
    );
  };

  const addNewTranslation = () => {
    if (!newKey.trim() || !newValueEn.trim() || !newValueAr.trim()) {
      toast.error(t("errors.fillAllFields"));
      return;
    }

    const exists = flattenedTranslations.some((t) => t.key === newKey);
    if (exists) {
      toast.error(t("errors.translationExists"));
      return;
    }

    setFlattenedTranslations((prev) => [
      ...prev,
      {
        key: newKey,
        en: newValueEn,
        ar: newValueAr,
      },
    ]);

    setNewKey("");
    setNewValueEn("");
    setNewValueAr("");
    toast.success(t("success.translationAdded"));
  };

  const deleteTranslation = (key: string) => {
    setFlattenedTranslations((prev) => prev.filter((t) => t.key !== key));
    toast.success(t("success.translationRemoved"));
  };

  const saveSectionTranslations = async () => {
    try {
      setIsSaving(true);

      const unflattenedData = unflattenTranslations(flattenedTranslations);

      const response = await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          en: unflattenedData.en,
          ar: unflattenedData.ar,
        }),
      });

      if (response.ok) {
        toast.success(t("success.saved", { section }));
        // Reload section data to reflect changes
        setTimeout(() => {
          loadSectionData();
        }, 1000);
      } else {
        throw new Error(t("errors.saving", { section }));
      }
    } catch (error) {
      toast.error(t("errors.saving", { section }));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const unflattenTranslations = (flattened: FlattenedTranslation[]) => {
    const en: TranslationData = {};
    const ar: TranslationData = {};

    flattened.forEach(({ key, en: enValue, ar: arValue }) => {
      setNestedValue(en, key, enValue);
      setNestedValue(ar, key, arValue);
    });

    return { en, ar };
  };

  const setNestedValue = (
    obj: TranslationData,
    path: string,
    value: string
  ) => {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key] as TranslationData;
    }

    current[keys[keys.length - 1]] = value;
  };

  const filteredTranslations = flattenedTranslations.filter(
    (t) =>
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportSectionTranslations = () => {
    const data = unflattenTranslations(flattenedTranslations);
    const blob = new Blob([JSON.stringify({ [section]: data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${section}-translations.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="size-6 animate-spin" />
          <span>{t("loading", { section })}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className={clsx(locale === "ar" && "rotate-180")} />
            {t("backToSections")}
          </Button>
          <div>
            <h2 className="text-xl font-bold capitalize">
              {t("translationsForSection", { section })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("managingTranslationsForSection", { section })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportSectionTranslations}
            variant="outline"
            size="sm"
          >
            <Download />
            {t("exportSection")}
          </Button>
          <Button
            onClick={saveSectionTranslations}
            disabled={isSaving}
            size="sm"
          >
            <Save />
            {isSaving ? <Loader2 className="animate-spin" /> : t("saveSection")}
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("searchInSectionTranslations", { section })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9"
          />
        </div>
        <Badge variant="secondary">
          {filteredTranslations.length} / {flattenedTranslations.length}
        </Badge>
      </div>

      {/* Add New Translation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("addNewTranslationToSection", { section })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={t("keyPlaceholder")}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Input
              placeholder={t("englishValue")}
              value={newValueEn}
              onChange={(e) => setNewValueEn(e.target.value)}
            />
            <Input
              placeholder={t("arabicValue")}
              value={newValueAr}
              onChange={(e) => setNewValueAr(e.target.value)}
            />
            <Button onClick={addNewTranslation}>
              <Plus />
              {t("addToSection", { section })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Translations List */}
      <div className="space-y-4">
        {filteredTranslations.map((translation, index) => (
          <Card
            key={`${translation.key}-${index}`}
            className="transition-all hover:shadow-md"
          >
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-3">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {t("keyInSection", { section })}
                  </div>
                  <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                    {section}.{translation.key}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    English
                  </div>
                  <Textarea
                    value={translation.en}
                    onChange={(e) =>
                      handleTranslationChange(
                        translation.key,
                        "en",
                        e.target.value
                      )
                    }
                    className="min-h-[60px]"
                    dir="ltr"
                  />
                </div>

                <div className="lg:col-span-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Arabic
                  </div>
                  <Textarea
                    value={translation.ar}
                    onChange={(e) =>
                      handleTranslationChange(
                        translation.key,
                        "ar",
                        e.target.value
                      )
                    }
                    className="min-h-[60px]"
                    dir="rtl"
                  />
                </div>

                <div className="lg:col-span-1 flex justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTranslation(translation.key)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTranslations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm
              ? t("noTranslationFound", { section, searchTerm })
              : t("noTranslationFoundInSection", { section })}
          </div>
        )}
      </div>
    </div>
  );
}
