interface CloudflareEnv {
  REMOVE_BG_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  API_RATE_LIMITER?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
}
