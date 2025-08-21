'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AnswerForm({ questionId }:{ questionId: string }) {
  const supabase = createClientComponentClient();
  const [phrase, setPhrase]   = useState('');
  const [meaning, setMeaning] = useState('');
  const [nuance, setNuance]   = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href='/auth'; return; }

      const { data: prof } = await supabase
        .from('profiles').select('username').eq('id', session.user.id).single();
      if (!prof?.username) { 
        alert('まずニックネームを設定してね'); 
        window.location.href='/profile'; 
        return; 
      }

      const { error } = await supabase.from('answers').insert({
        question_id: questionId,
        phrase: phrase.trim()   || null,
        meaning: meaning.trim() || null,
        nuance: nuance.trim()   || null,
        user_id: session.user.id,
      });
      if (error) throw error;

      setPhrase(''); setMeaning(''); setNuance('');
      window.dispatchEvent(new CustomEvent('qa:posted'));
    } catch (e:any) {
      setErr(e.message ?? '投稿に失敗しました');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input value={phrase} onChange={e=>setPhrase(e.target.value)}
        placeholder="表現" className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      <input value={meaning} onChange={e=>setMeaning(e.target.value)}
        placeholder="意味" className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      <textarea value={nuance} onChange={e=>setNuance(e.target.value)}
        placeholder="ニュアンス・使い方"
        className="w-full h-24 rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={loading}
        className="rounded-lg px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white">
        {loading ? '送信中…' : '回答する'}
      </button>
    </form>
  );
}