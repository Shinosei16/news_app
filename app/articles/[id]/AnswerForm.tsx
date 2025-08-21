// app/_components/AnswerForm.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AnswerForm({ questionId }: { questionId: string }) {
  const supabase = createClientComponentClient();
  const [phrase, setPhrase] = useState('');
  const [meaning, setMeaning] = useState('');
  const [nuance, setNuance] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = '/auth'; return; }

      const { error } = await supabase.from('answers').insert({
        question_id: questionId,
        phrase: phrase.trim() || null,
        meaning: meaning.trim() || null,
        nuance: nuance.trim() || null,
        user_id: session.user.id,
      });
      if (error) throw error;

      setPhrase(''); setMeaning(''); setNuance('');
      window.dispatchEvent(new Event('qa:posted'));
    } catch (e:any) {
      setErr(e.message ?? '投稿に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input placeholder="表現" value={phrase}
        onChange={e=>setPhrase(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      <input placeholder="意味" value={meaning}
        onChange={e=>setMeaning(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      <input placeholder="ニュアンス・使い方" value={nuance}
        onChange={e=>setNuance(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={busy}
        className="rounded-lg px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 disabled:opacity-60 text-white">
        {busy ? '送信中…' : '回答を投稿'}
      </button>
    </form>
  );
}