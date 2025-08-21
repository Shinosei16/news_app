'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function QuestionForm({ articleId, onDone }: { articleId: number; onDone?: () => void }) {
  const [phrase, setPhrase] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!phrase.trim()) { setErr('フレーズは必須'); return; }
    setSaving(true);
    const { error } = await supabase.from('questions').insert({
      article_id: articleId,
      phrase: phrase.trim(),
      comment: comment.trim() || null,
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setPhrase(''); setComment('');
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4 rounded-xl bg-gray-800/40">
      <div>
        <label className="block text-sm text-gray-300">分からないフレーズ</label>
        <input
          value={phrase}
          onChange={(e)=>setPhrase(e.target.value)}
          placeholder="例: in light of"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300">補足（任意）</label>
        <textarea
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          rows={2}
          placeholder="どの文で困ったか等"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
        />
      </div>
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={saving} className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60">
        {saving ? '送信中…' : '質問を投稿'}
      </button>
    </form>
  );
}