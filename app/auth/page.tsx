'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null); setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) throw error;
        setMsg('サインアップ完了。メールの確認が必要な場合があります。');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        window.location.href = '/profile'; // 初回はニックネーム設定へ
      }
    } catch (e: any) {
      setErr(e.message ?? 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:420, margin:'40px auto', padding:'0 20px'}}>
      <Link href="/" style={{textDecoration:'underline'}}>{'<'} 戻る</Link>
      <h1 style={{fontWeight:700, margin:'16px 0'}}>{mode==='signup'?'新規登録':'ログイン'}</h1>

      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="メールアドレス" type="email"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"/>
        <input value={pw} onChange={e=>setPw(e.target.value)}
          placeholder="パスワード" type="password"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"/>
        {err && <p style={{color:'#f87171'}}>{err}</p>}
        {msg && <p style={{color:'#22c55e'}}>{msg}</p>}
        <button disabled={loading}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {loading ? '送信中…' : (mode==='signup'?'登録する':'ログイン')}
        </button>
      </form>

      <div style={{marginTop:12}}>
        <button onClick={()=>setMode(mode==='signup'?'signin':'signup')}
          className="text-sm underline">
          {mode==='signup'?'ログインはこちら':'新規登録はこちら'}
        </button>
      </div>
    </main>
  );
}