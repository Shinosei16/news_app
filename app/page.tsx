'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('articles').select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data);
    })();
  }, []);

  return (
    <main style={{padding:20}}>
      <h1 style={{fontWeight:'bold'}}>今日の記事</h1>
      <ul style={{marginTop:12}}>
        {rows.map(a => (
          <li key={a.id} style={{margin:'8px 0'}}>
            <Link href={`/articles/${a.id}`}>{a.title || a.url}</Link>
          </li>
        ))}
      </ul>
      <div style={{marginTop:16}}>
        <Link href="/new-article">記事を登録（運営）</Link>
      </div>
    </main>
  );
}