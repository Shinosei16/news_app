// app/_components/QuestionForm.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function QuestionForm({ articleId }: { articleId: string }) {
  const supabase = createClientComponentClient();
  const [phrase, setPhrase] = useState('');
  const [comment, setComment] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = '/auth'; return; }

      const { error } = await supabase.from('questions').insert({
        article_id: articleId,
        phrase: phrase.trim() || null,
        comment: comment.trim() || null,
        user_id: session.user.id, // ★重要
      });
      if (error) throw error;

      setPhrase(''); setComment('');
      window.dispatchEvent(new Event('qa:posted'));
    } catch (e:any) {
      setErr(e.message ?? '投稿に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input placeholder="分からないフレーズ" value={phrase}
        onChange={e=>setPhrase(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      <input placeholder="補足（任意）" value={comment}
        onChange={e=>setComment(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none" />
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={busy}
        className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
        {busy ? '送信中…' : '質問を投稿'}
      </button>
    </form>
  );
}