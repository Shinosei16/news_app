'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function QuestionForm({ articleId }:{ articleId: string }) {
  const supabase = createClientComponentClient();
  const [phrase, setPhrase] = useState('');
  const [comment, setComment] = useState('');
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

      const { error } = await supabase.from('questions').insert({
        article_id: articleId,
        phrase: phrase.trim(),
        comment: comment.trim() || null,
        user_id: session.user.id,
      });
      if (error) throw error;

      setPhrase(''); setComment('');
      // ← ここで親に知らせる（関数渡し不要）
      window.dispatchEvent(new CustomEvent('qa:posted'));
    } catch (e:any) {
      setErr(e.message ?? '投稿に失敗しました');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        value={phrase} onChange={e=>setPhrase(e.target.value)}
        placeholder="分からないフレーズ"
        className="w-full rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
      />
      <textarea
        value={comment} onChange={e=>setComment(e.target.value)}
        placeholder="補足（任意）"
        className="w-full h-24 rounded-md px-3 py-2 bg-gray-900 text-white border border-gray-700 outline-none"
      />
      {err && <p className="text-red-400 text-sm">{err}</p>}
      <button disabled={loading}
        className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white">
        {loading ? '送信中…' : '質問を投稿'}
      </button>
    </form>
  );
}