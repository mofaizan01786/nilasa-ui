"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NavigationConfig, NavigationMenuItem } from "./types";
import { getNavigationDirect } from "./siteData";

export async function getNavigationServerAction(): Promise<NavigationConfig> {
  return getNavigationDirect();
}

export async function saveNavigationServerAction(
  items: NavigationMenuItem[]
): Promise<{ success: boolean; data?: NavigationConfig; error?: string }> {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "navigation.json");

    const updated: NavigationConfig = {
      updatedAt: new Date().toISOString(),
      items: items.map((item, index) => ({
        ...item,
        order: index + 1
      }))
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

    // Revalidate paths so changes show up across the whole app
    revalidatePath("/");
    revalidatePath("/admin/navigation");

    return {
      success: true,
      data: updated
    };
  } catch (err: any) {
    console.error("Error saving data/navigation.json:", err);
    return {
      success: false,
      error: err?.message || "Failed to write data/navigation.json"
    };
  }
}
