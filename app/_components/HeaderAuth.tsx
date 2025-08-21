'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HeaderAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  async function handleLogin() {
    const email = prompt('メールアドレスを入力してください:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('ログインリンクを送信しました');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header style={{ display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #ccc' }}>
      <div style={{ fontWeight:'bold' }}>記事アプリ</div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>
              {user.email} さん
            </span>
            <button onClick={handleLogout}>ログアウト</button>
          </>
        ) : (
          <button onClick={handleLogin}>ログイン</button>
        )}
      </div>
    </header>
  );
}