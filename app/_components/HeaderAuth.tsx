// app/_components/HeaderAuth.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function HeaderAuth() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  async function refreshUser() {
    const { data: { session } } = await supabase.auth.getSession();
    const u = session?.user ?? null;
    setEmail(u?.email ?? null);
    if (u) {
      const { data } = await supabase.from('profiles').select('username').eq('id', u.id).single();
      setUsername(data?.username ?? null);
    } else {
      setUsername(null);
    }
  }

  useEffect(() => {
    refreshUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshUser());
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <header style={{ padding:'12px 20px', borderBottom:'1px solid #374151',
      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <Link href="/" style={{fontWeight:700}}>英語ニュースQA</Link>
      <nav style={{display:'flex', gap:12, alignItems:'center'}}>
        <Link href="/new-article" className="underline">記事を登録</Link>
        {email ? (
          <>
            <span className="text-xs text-gray-300">{username ?? email}</span>
            <form action="#" onSubmit={async (e)=>{e.preventDefault(); await supabase.auth.signOut(); location.href='/'}}>
              <button className="px-3 py-1 border border-gray-600 rounded">ログアウト</button>
            </form>
          </>
        ) : (
          <Link href="/auth" className="px-3 py-1 border border-gray-600 rounded">ログイン</Link>
        )}
      </nav>
    </header>
  );
}