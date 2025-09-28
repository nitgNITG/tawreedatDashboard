/**
 * Translation Management API
 *
 * Features:
 * - GET: Fetch all keys, specific sections, or full translations
 * - PUT: Update sections or full translation files
 * - DELETE: Remove entire translation sections
 *
 * Backup Strategy:
 * - Creates timestamped backups before any write operation
 * - Deletes backup files after successful operations (GitHub handles persistence)
 * - Backups only kept during operation for rollback safety
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TRANSLATIONS_DIR = path.join(process.cwd(), "i18n", "lang");

// Utility function to delete backup files after successful operations
async function deleteBackupFiles(timestamp: string) {
  try {
    const backupDir = path.join(TRANSLATIONS_DIR, "backups");
    const enBackupPath = path.join(backupDir, `en-${timestamp}.json`);
    const arBackupPath = path.join(backupDir, `ar-${timestamp}.json`);

    await Promise.all([
      fs
        .unlink(enBackupPath)
        .catch((err) => console.warn(`Failed to delete EN backup: ${err}`)),
      fs
        .unlink(arBackupPath)
        .catch((err) => console.warn(`Failed to delete AR backup: ${err}`)),
    ]);

    console.log(
      `Deleted backup files: en-${timestamp}.json, ar-${timestamp}.json`
    );
  } catch (error) {
    console.warn("Failed to delete backup files:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const keysOnly = searchParams.get("keys") === "true";

    const enPath = path.join(TRANSLATIONS_DIR, "en.json");
    const arPath = path.join(TRANSLATIONS_DIR, "ar.json");

    const [enContent, arContent] = await Promise.all([
      fs.readFile(enPath, "utf-8"),
      fs.readFile(arPath, "utf-8"),
    ]);

    const enData = JSON.parse(enContent);
    const arData = JSON.parse(arContent);

    // If requesting only keys, return top-level keys
    if (keysOnly) {
      const enKeys = Object.keys(enData);
      const arKeys = Object.keys(arData);
      const allKeys = Array.from(new Set([...enKeys, ...arKeys]));

      return NextResponse.json({ keys: allKeys });
    }

    // If requesting a specific section
    if (section) {
      const enSection = enData[section] || {};
      const arSection = arData[section] || {};

      return NextResponse.json({
        section,
        en: enSection,
        ar: arSection,
      });
    }

    // Default: return all translations (for backward compatibility)
    return NextResponse.json({
      en: enData,
      ar: arData,
    });
  } catch (error) {
    console.error("Error reading translation files:", error);
    return NextResponse.json(
      { error: "Failed to load translations" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { section, en, ar } = await request.json();

    const enPath = path.join(TRANSLATIONS_DIR, "en.json");
    const arPath = path.join(TRANSLATIONS_DIR, "ar.json");

    // Read current files
    const [enContent, arContent] = await Promise.all([
      fs.readFile(enPath, "utf-8"),
      fs.readFile(arPath, "utf-8"),
    ]);

    const enData = JSON.parse(enContent);
    const arData = JSON.parse(arContent);

    // Create backup of current files
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(TRANSLATIONS_DIR, "backups");

    let backupCreated = false;
    try {
      await fs.mkdir(backupDir, { recursive: true });
      await Promise.all([
        fs.copyFile(enPath, path.join(backupDir, `en-${timestamp}.json`)),
        fs.copyFile(arPath, path.join(backupDir, `ar-${timestamp}.json`)),
      ]);
      backupCreated = true;
    } catch (backupError) {
      console.warn("Failed to create backup:", backupError);
    }

    // Update specific section or entire file
    if (section) {
      enData[section] = en;
      arData[section] = ar;
    } else {
      // Update entire files (backward compatibility)
      Object.assign(enData, en);
      Object.assign(arData, ar);
    }

    // Write updated translations
    await Promise.all([
      fs.writeFile(enPath, JSON.stringify(enData, null, 2), "utf-8"),
      fs.writeFile(arPath, JSON.stringify(arData, null, 2), "utf-8"),
    ]);

    // Delete backup files after successful operation (GitHub has the backup)
    if (backupCreated) {
      deleteBackupFiles(timestamp).catch((err) =>
        console.warn("Failed to delete backup files:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving translation files:", error);
    return NextResponse.json(
      { error: "Failed to save translations" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    if (!section) {
      return NextResponse.json(
        { error: "Section parameter is required" },
        { status: 400 }
      );
    }

    const enPath = path.join(TRANSLATIONS_DIR, "en.json");
    const arPath = path.join(TRANSLATIONS_DIR, "ar.json");

    // Read current files
    const [enContent, arContent] = await Promise.all([
      fs.readFile(enPath, "utf-8"),
      fs.readFile(arPath, "utf-8"),
    ]);

    const enData = JSON.parse(enContent);
    const arData = JSON.parse(arContent);

    // Check if section exists
    if (!enData[section] && !arData[section]) {
      return NextResponse.json(
        { error: `Section "${section}" does not exist` },
        { status: 404 }
      );
    }

    // Create backup of current files
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(TRANSLATIONS_DIR, "backups");

    let backupCreated = false;
    try {
      await fs.mkdir(backupDir, { recursive: true });
      await Promise.all([
        fs.copyFile(enPath, path.join(backupDir, `en-${timestamp}.json`)),
        fs.copyFile(arPath, path.join(backupDir, `ar-${timestamp}.json`)),
      ]);
      backupCreated = true;
    } catch (backupError) {
      console.warn("Failed to create backup:", backupError);
    }

    // Delete the section from both language files
    delete enData[section];
    delete arData[section];

    // Write updated translations
    await Promise.all([
      fs.writeFile(enPath, JSON.stringify(enData, null, 2), "utf-8"),
      fs.writeFile(arPath, JSON.stringify(arData, null, 2), "utf-8"),
    ]);

    // Delete backup files after successful operation (GitHub has the backup)
    if (backupCreated) {
      deleteBackupFiles(timestamp).catch((err) =>
        console.warn("Failed to delete backup files:", err)
      );
    }

    return NextResponse.json({
      success: true,
      message: `Section "${section}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting translation section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
