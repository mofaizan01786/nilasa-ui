"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { BannersConfig } from "./types";
import { getBannersDirect } from "./siteData";

export async function getBannersServerAction(): Promise<BannersConfig> {
  return getBannersDirect();
}

export async function saveBannersServerAction(
  config: BannersConfig
): Promise<{ success: boolean; data?: BannersConfig; error?: string }> {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "banners.json");

    const updated: BannersConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

    // Revalidate home page and admin page instantly
    revalidatePath("/");
    revalidatePath("/admin/banners");

    return {
      success: true,
      data: updated
    };
  } catch (err: any) {
    console.error("Error saving data/banners.json:", err);
    return {
      success: false,
      error: err?.message || "Failed to write data/banners.json"
    };
  }
}
