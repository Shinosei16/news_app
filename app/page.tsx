'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Article = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function Home() {
  const [rows, setRows] = useState<Article[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data);
    })();
  }, []);

  // 日付ごとにグループ化
  const grouped = rows.reduce((acc: Record<string, Article[]>, article) => {
    const date = new Date(article.created_at);
    const dateKey = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(article);
    return acc;
  }, {});

  return (
    <main style={{padding:20}}>
      <h1 style={{fontWeight:'bold'}}>記事一覧</h1>
      {Object.entries(grouped).map(([date, articles]) => (
        <div key={date} style={{marginTop:24}}>
          <h2 style={{fontWeight:'bold', fontSize:18}}>{date} の記事</h2>
          <ul style={{marginTop:8}}>
            {articles.map(a => (
              <li key={a.id} style={{margin:'6px 0'}}>
                <Link 
                  href={`/articles/${a.id}`}
                  style={{textDecoration:'underline'}}
                >
                  {a.title || a.url}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{marginTop:16}}>
        <Link href="/new-article">記事を登録（運営）</Link>
      </div>
    </main>
  );
}