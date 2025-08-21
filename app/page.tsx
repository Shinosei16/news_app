// app/page.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Article = { id: string; title: string|null; url: string|null; created_at: string };

export default function Home() {
  const supabase = createClientComponentClient();
  const [rows, setRows] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    setErr(null); setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, url, created_at')
      .order('created_at', { ascending: false });
    if (error) setErr(error.message);
    setRows((data ?? []) as Article[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase.channel('articles-ch').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'articles' },
      () => load()
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <main style={{padding:20}}>
      <h1 style={{fontWeight:'bold'}}>今日の記事</h1>

      {loading && <p className="text-gray-400 mt-2">読み込み中…</p>}
      {err && <p className="text-red-400 mt-2">Error: {err}</p>}
      {!loading && !err && rows.length === 0 && (
        <p className="text-gray-400 mt-2">まだ記事がありません</p>
      )}

      <ul style={{marginTop:12}}>
        {rows.map(a => (
          <li key={a.id} style={{margin:'8px 0'}}>
            <Link href={`/articles/${a.id}`} className="underline">
              {a.title || a.url}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{marginTop:16}}>
        <Link href="/new-article" className="underline">記事を登録（運営）</Link>
      </div>
    </main>
  );
}