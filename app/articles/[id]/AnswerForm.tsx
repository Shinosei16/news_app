'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AnswerForm({ questionId, onDone }: { questionId: number; onDone?: () => void }) {
  const [phrase, setPhrase] = useState('');
  const [meaning, setMeaning] = useState('');
  const [nuance, setNuance] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!phrase.trim() && !meaning.trim() && !nuance.trim()) {
      setErr('最低1つは入力してね'); return;
    }
    setSaving(true);
    const { error } = await supabase.from('answers').insert({
      question_id: questionId,
      phrase: phrase.trim() || null,
      meaning: meaning.trim() || null,
      nuance:  nuance.trim()  || null,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setPhrase(''); setMeaning(''); setNuance('');
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4 rounded-xl bg-gray-800/40">
      <div>
        <label className="block text-sm text-gray-300">表現</label>
        <input value={phrase} onChange={(e)=>setPhrase(e.target.value)}
          placeholder="例: in light of"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      </div>
      <div>
        <label className="block text-sm text-gray-300">意味</label>
        <textarea value={meaning} onChange={(e)=>setMeaning(e.target.value)} rows={2}
          placeholder="例: ～を踏まえて／〜という事情から"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      </div>
      <div>
        <label className="block text-sm text-gray-300">ニュアンス・使い方</label>
        <textarea value={nuance} onChange={(e)=>setNuance(e.target.value)} rows={3}
          placeholder="フォーマル寄り。because of より文語。Ex) In light of recent events, ..."
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      </div>
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={saving} className="rounded-lg px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60">
        {saving ? '保存中…' : '回答を投稿'}
      </button>
    </form>
  );
}