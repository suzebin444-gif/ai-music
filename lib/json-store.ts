import { kv } from "@vercel/kv";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const KV_PREFIX = "sqmusic:data:";

export function isKvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL?.trim() &&
      process.env.KV_REST_API_TOKEN?.trim()
  );
}

function kvKey(filename: string): string {
  return `${KV_PREFIX}${filename}`;
}

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

async function readFromDisk<T>(filename: string, fallback: T): Promise<T> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(filePath(filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.warn(`[json-store] disk read ${filename}:`, err.message);
    }
    return fallback;
  }
}

async function writeToDisk<T>(filename: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = filePath(filename);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  const payload = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, payload, "utf-8");
  await fs.rename(tmp, target);
}

async function readFromKv<T>(filename: string, fallback: T): Promise<T> {
  const stored = await kv.get<T>(kvKey(filename));
  if (stored !== null && stored !== undefined) {
    return stored;
  }

  const fromDisk = await readFromDisk<T>(filename, fallback);
  const hasDiskData = JSON.stringify(fromDisk) !== JSON.stringify(fallback);
  if (hasDiskData) {
    await kv.set(kvKey(filename), fromDisk);
    console.info(`[json-store] migrated ${filename} to Vercel KV`);
  }
  return fromDisk;
}

async function writeToKv<T>(filename: string, data: T): Promise<void> {
  await kv.set(kvKey(filename), data);
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  if (isKvConfigured()) {
    try {
      return await readFromKv(filename, fallback);
    } catch (error) {
      console.error(`[json-store] KV read ${filename} failed:`, error);
      return readFromDisk(filename, fallback);
    }
  }
  return readFromDisk(filename, fallback);
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  if (isKvConfigured()) {
    await writeToKv(filename, data);
    return;
  }
  await writeToDisk(filename, data);
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
