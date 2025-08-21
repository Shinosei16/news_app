'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = '/auth'; return; }
      setEmail(session.user.email ?? null);

      const { data } = await supabase.from('profiles')
        .select('username').eq('id', session.user.id).single();
      if (data?.username) setUsername(data.username);
    })();
  }, [supabase]);

  async function save() {
    setErr(null); setMsg(null); setSaving(true);
    try {
      if (!username.trim()) throw new Error('ニックネームは必須です');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('ログインが必要です');
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id, username: username.trim()
      });
      if (error) throw error;
      setMsg('保存しました');
    } catch (e:any) { setErr(e.message ?? '保存に失敗しました'); }
    finally { setSaving(false); }
  }

  return (
    <main style={{maxWidth:520, margin:'40px auto', padding:'0 20px'}}>
      <Link href="/" className="underline">{'<'} 戻る</Link>
      <h1 style={{fontWeight:700, margin:'16px 0'}}>プロフィール</h1>
      <p className="text-sm text-gray-400">ログイン中: {email ?? '—'}</p>

      <label className="block text-sm mt-4 mb-1">ニックネーム（必須）</label>
      <input value={username} onChange={e=>setUsername(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
        placeholder="例: seiya"/>

      {err && <p style={{color:'#f87171', marginTop:8}}>{err}</p>}
      {msg && <p style={{color:'#22c55e', marginTop:8}}>{msg}</p>}

      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button onClick={save} disabled={saving}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
          {saving ? '保存中…' : '保存'}
        </button>
        <Link href="/" className="underline">トップへ</Link>
      </div>
    </main>
  );
}