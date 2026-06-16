// ─────────────────────────────────────────────────────
// Supabase クライアント初期化
// キーは .env.local を参照して設定済み（バニラHTMLのため直接記述）
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
// ─────────────────────────────────────────────────────
const SUPABASE_URL = 'https://bturaaafeetnfptpqwai.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tYcxqQR5mMYkyqjXDHsNHQ_JNHNa2gj';

if (!window.supabase) {
  console.error('[CIELO] supabase-js の読み込みに失敗しました。CDN接続を確認してください。');
}

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
