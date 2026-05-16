import { promises as fs } from "fs";
import os from "os";
import path from "path";

/**
 * Vercel/Lambda only allow writes under /tmp.
 * Local dev keeps using project /data.
 */
function resolveDataDir(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "sqmusic-data");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();

function filePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(filePath(filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.warn(`[json-store] read ${filename} failed:`, err.message);
    }
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = filePath(filename);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  const payload = JSON.stringify(data, null, 2);

  await fs.writeFile(tmp, payload, "utf-8");
  await fs.rename(tmp, target);
}

export async function tryWriteJsonFile<T>(
  filename: string,
  data: T
): Promise<boolean> {
  try {
    await writeJsonFile(filename, data);
    return true;
  } catch (error) {
    console.error(`[json-store] write ${filename} failed:`, error);
    return false;
  }
}
