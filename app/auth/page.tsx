// app/auth/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const [mode, setMode] = useState<'signup'|'signin'>('signup');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setErr(null); setMsg(null); }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === 'signup') {
        if (!username.trim()) throw new Error('ユーザー名を入れてね');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const session = data.session; const user = data.user;

        if (session && user) {
          const { error: e2 } = await supabase.from('profiles').upsert({ id: user.id, username: username.trim() });
          if (e2) throw e2;
          setMsg('登録完了！トップへ戻ります。'); setTimeout(()=>{location.href='/'}, 400);
        } else {
          setMsg('確認メールを送ったよ。メールのリンクを踏んだ後、ログインしてね。');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const uid = data.user?.id;
        if (uid) {
          const { data: prof } = await supabase.from('profiles').select('username').eq('id', uid).single();
          if (!prof?.username) { setMsg('まずはユーザー名を設定しよう'); setTimeout(()=>{location.href='/profile'}, 400); return; }
        }
        setMsg('ログインしました。トップへ戻ります。'); setTimeout(()=>{location.href='/'}, 300);
      }
    } catch (e:any) { setErr(e.message ?? '処理に失敗しました'); }
    finally { setBusy(false); }
  }

  return (
    <main style={{maxWidth:420, margin:'40px auto', padding:'0 20px'}}>
      <Link href="/" className="underline">{'<'} 戻る</Link>
      <h1 className="text-xl font-bold mt-3">{mode==='signup'?'新規登録':'ログイン'}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div><label className="block text-sm mb-1">メールアドレス</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
            className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"/></div>
        <div><label className="block text-sm mb-1">パスワード</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password"
            className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"/></div>
        {mode==='signup' && (
          <div><label className="block text-sm mb-1">ユーザー名（表示名）</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="例: seiya"
              className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"/></div>
        )}
        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}
        <button disabled={busy} className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {busy ? '送信中…' : (mode==='signup'?'登録する':'ログイン')}
        </button>
      </form>
      <div className="text-sm text-gray-400 mt-3">
        {mode==='signup' ? <>すでにある？ <button className="underline" onClick={()=>setMode('signin')}>ログインへ</button></>
          : <>はじめて？ <button className="underline" onClick={()=>setMode('signup')}>新規登録へ</button></>}
      </div>
    </main>
  );
}