'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewArticlePage() {
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 追加後に使う
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!url.trim() || !title.trim()) {
      setErr('URL と タイトルは必須だよ');
      return;
    }
    setSaving(true);

    // uuid の id を返してもらう
    const { data, error } = await supabase
      .from('articles')
      .insert({ url: url.trim(), title: title.trim() })
      .select('id')
      .single();

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setCreatedId(data?.id ?? null); // 成功！→ 成功画面に切り替える
    setUrl('');
    setTitle('');
  }

  // 追加後の画面（「戻る」や「開く」ボタンを出す）
  if (createdId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="text-sm">
          <Link href="/" className="text-blue-400 hover:underline">{'<'} 戻る</Link>
        </div>

        <h1 className="text-xl font-semibold text-white">記事を追加しました</h1>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white"
          >
            記事一覧へ戻る
          </Link>

          <Link
            href={`/articles/${createdId}`}
            className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            いま追加した記事を開く
          </Link>

          <button
            onClick={() => setCreatedId(null)}
            className="rounded-lg px-4 py-2 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
          >
            もう1件追加する
          </button>
        </div>
      </main>
    );
  }

  // 通常の入力フォーム
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="text-sm">
        <Link href="/" className="text-blue-400 hover:underline">{'<'} 戻る</Link>
      </div>

      <h1 className="text-xl font-semibold text-white">記事を登録（運営）</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article..."
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="記事タイトル"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
        />
        {err && <p className="text-red-400 text-sm">エラー: {err}</p>}
        <button
          disabled={saving}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white"
        >
          {saving ? '追加中…' : '追加'}
        </button>
      </form>
    </main>
  );
}