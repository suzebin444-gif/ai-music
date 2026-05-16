export async function readDeepseekErrorMessage(
  response: Response
): Promise<string> {
  const raw = await response.text();
  try {
    const data = JSON.parse(raw) as {
      error?: { message?: string };
      message?: string;
    };
    return data.error?.message ?? data.message ?? raw.slice(0, 200);
  } catch {
    return raw.slice(0, 200) || response.statusText;
  }
}
