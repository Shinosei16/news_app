// app/new-article/page.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewArticlePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = '/auth'; return; }

      const { error } = await supabase.from('articles').insert({
        title: title.trim() || null,
        url: url.trim() || null,
      });
      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (e:any) {
      setErr(e.message ?? '登録に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{padding:20, maxWidth:520, margin:'0 auto'}}>
      <Link href="/" className="underline">{'< 戻る'}</Link>
      <h1 className="text-xl font-bold mt-3">記事を登録（運営）</h1>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <input placeholder="タイトル（任意）" value={title}
          onChange={e=>setTitle(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
        <input placeholder="URL（任意）" value={url}
          onChange={e=>setUrl(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={busy}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {busy ? '登録中…' : '登録する'}
        </button>
      </form>
    </main>
  );
}