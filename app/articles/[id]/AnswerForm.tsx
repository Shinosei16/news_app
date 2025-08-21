'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AnswerForm({
  articleId,
  onDone,
}: {
  articleId: number;
  onDone?: () => void;
}) {
  const [phrase, setPhrase] = useState('');
  const [meaning, setMeaning] = useState('');
  const [nuance, setNuance] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!phrase.trim() && !meaning.trim() && !nuance.trim()) {
      setError('最低でも1つは入力してね');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('answers').insert({
      article_id: articleId,
      phrase: phrase.trim() || null,
      meaning: meaning.trim() || null,
      nuance: nuance.trim() || null,
    });
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPhrase('');
    setMeaning('');
    setNuance('');
    onDone?.(); // 親で再読み込み関数を渡してたら呼ぶ
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl bg-gray-800/40">
      <div className="space-y-1">
        <label className="block text-sm text-gray-300">表現</label>
        <input
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="例: take a toll on"
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white outline-none border border-gray-700"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-gray-300">意味</label>
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="例: ～に悪影響を与える / 損害を与える"
          rows={2}
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white outline-none border border-gray-700"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-gray-300">ニュアンス・使い方</label>
        <textarea
          value={nuance}
          onChange={(e) => setNuance(e.target.value)}
          placeholder="例: 長期的にダメージが蓄積する時に使う。Ex) The stress took a toll on her health."
          rows={3}
          className="w-full rounded-md px-3 py-2 bg-gray-900 text-white outline-none border border-gray-700"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
      >
        {saving ? '保存中…' : '回答を投稿'}
      </button>
    </form>
  );
}