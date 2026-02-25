// Supabase クエリをタイムアウト＋リトライ付きで実行するユーティリティ

const TIMEOUT_MS = 15000
const MAX_RETRIES = 2

type SupabaseResult<T> = {
  data: T | null
  error: { message: string } | null
}

export async function fetchWithRetry<T>(
  queryFn: () => PromiseLike<SupabaseResult<T>>,
  retryCount = 0
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      ),
    ])

    if (result.error) {
      throw new Error(result.error.message)
    }

    return { data: result.data, error: null }
  } catch (err) {
    const attempt = retryCount + 1
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error(`[fetchWithRetry] エラー (試行${attempt}/${MAX_RETRIES + 1}): ${msg}`)

    if (retryCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1000 * attempt))
      return fetchWithRetry(queryFn, retryCount + 1)
    }

    const errorMsg = msg === 'timeout'
      ? 'データの取得がタイムアウトしました。再読み込みをお試しください。'
      : 'データの取得に失敗しました'

    return { data: null, error: errorMsg }
  }
}
