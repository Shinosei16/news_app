'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const [mode, setMode] = useState<'signup'|'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');          // ★ 追加
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setErr(null); setMsg(null); }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === 'signup') {
        if (!username.trim()) throw new Error('ユーザー名を入れてね');

        // サインアップ
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error('ユーザー作成に失敗しました');

        // プロフィール作成/更新（id は auth.users の id）
        const { error: e2 } = await supabase.from('profiles').upsert({
          id: user.id,
          username: username.trim(),
        });
        if (e2) throw e2;

        setMsg('登録完了！トップに戻ります。');
        setTimeout(() => { window.location.href = '/'; }, 500);
      } else {
        // サインイン
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('ログインしました。トップに戻ります。');
        setTimeout(() => { window.location.href = '/'; }, 300);
      }
    } catch (e:any) {
      setErr(e.message ?? '処理に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{maxWidth:420, margin:'40px auto', padding:'0 20px'}}>
      <Link href="/" className="underline">{'<'} 戻る</Link>
      <h1 className="text-xl font-bold mt-3">{mode === 'signup' ? '新規登録' : 'ログイン'}</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
            className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
        </div>

        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password"
            className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-sm mb-1">ユーザー名（表示名・必須）</label>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="例: seiya"
              className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
          </div>
        )}

        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}

        <button disabled={busy}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {busy ? '送信中…' : (mode === 'signup' ? '登録する' : 'ログイン')}
        </button>
      </form>

      <div className="text-sm text-gray-400 mt-3">
        {mode === 'signup' ? (
          <>すでにアカウントがある？{' '}
            <button className="underline" onClick={()=>setMode('signin')}>ログインへ</button>
          </>
        ) : (
          <>はじめて？{' '}
            <button className="underline" onClick={()=>setMode('signup')}>新規登録へ</button>
          </>
        )}
      </div>
    </main>
  );
}