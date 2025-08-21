// app/profile/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { location.href = '/auth'; return; }
      const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
      if (data?.username) setUsername(data.username);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setMsg(null); setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('ログインが必要です');
      const { error } = await supabase.from('profiles').upsert({ id: session.user.id, username: username.trim() }).select().single();
      if (error) throw error;
      setMsg('保存しました');
    } catch (e:any) { setErr(e.message ?? '保存に失敗しました'); }
    finally { setBusy(false); }
  }

  return (
    <main style={{maxWidth:420, margin:'40px auto', padding:'0 20px'}}>
      <h1 className="text-xl font-bold">プロフィール</h1>
      <form onSubmit={save} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">ユーザー名</label>
          <input value={username} onChange={e=>setUsername(e.target.value)}
            className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}
        <button disabled={busy} className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {busy ? '保存中…' : '保存する'}
        </button>
      </form>
    </main>
  );
}