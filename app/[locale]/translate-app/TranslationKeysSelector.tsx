"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import TranslationSectionManager from "./TranslationSectionManager";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface TranslationKeysSelectorProps {
  keys: string[];
}

export default function TranslationKeysSelector({
  keys,
}: Readonly<TranslationKeysSelectorProps>) {
  const t = useTranslations("translations");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredKeys = keys.filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDeleteSection = async (section: string) => {
    if (!window.confirm(t("deleteSectionConfirmation", { section }))) {
      return;
    }

    setIsDeleting(true);
    setSectionToDelete(section);

    try {
      const response = await fetch(`/api/translations?section=${section}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || t("sectionDeleted", { section }));
        // Refresh the page to update the sections list
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || t("failedToDeleteSection", { section })
        );
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(t("failedToDeleteSection", { section }));
    } finally {
      setIsDeleting(false);
      setSectionToDelete(null);
    }
  };

  if (selectedSection) {
    return (
      <TranslationSectionManager
        section={selectedSection}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9"
          />
        </div>
        <Badge variant="secondary">
          {filteredKeys.length} / {keys.length} {t("sections")}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="size-4 me-2" />
          {t("refresh")}
        </Button>
      </div>

      {/* Available Translation Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {t("sectionsTitle")}
            <AlertTriangle className="size-5 text-amber-500" />
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("selectSection")}
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="size-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>{t("warning")}</strong> {t("hoverToReveal")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredKeys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeys.map((key) => (
                <Card
                  key={key}
                  className="relative group transition-all hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedSection(key)}
                      >
                        <h3 className="font-semibold capitalize">{key}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("clickToManage")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(key);
                          }}
                          disabled={isDeleting && sectionToDelete === key}
                        >
                          {isDeleting && sectionToDelete === key ? (
                            <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? `${t("noSectionsFound")} "${searchTerm}"`
                : t("noSectionsFound")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {keys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("statistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {keys.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("totalSections")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredKeys.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("filteredResults")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-muted-foreground">
                  {t("languages")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  AR + EN
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("supported")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
