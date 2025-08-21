'use client';
export const dynamic = 'force-dynamic';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { AnswerForm } from './AnswerForm';

type Article = {
  id: number;
  title: string;
  content?: string | null; // ← content に統一
  created_at?: string;
};

type Answer = {
  id: number;
  phrase?: string | null;
  meaning?: string | null;
  nuance?: string | null;
  created_at?: string;
};

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>; // Next.js 15: params は Promise
}) {
  const { id } = use(params); // Promise をほどく
  const articleId = Number(id);

  const [article, setArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadArticle = useCallback(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, content, created_at') // ← body を外す
      .eq('id', articleId)
      .single();

    if (error) throw new Error(error.message);
    setArticle(data);
  }, [articleId]);

  const loadAnswers = useCallback(async () => {
    const { data, error } = await supabase
      .from('answers')
      .select('id, phrase, meaning, nuance, created_at')
      .eq('article_id', articleId)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    setAnswers(data ?? []);
  }, [articleId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await Promise.all([loadArticle(), loadAnswers()]);
      } catch (e: any) {
        setErr(e.message ?? '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadArticle, loadAnswers]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-blue-400 hover:underline">{'<'} 戻る</Link>
        <span className="text-xs text-gray-400">Article ID: {articleId}</span>
      </div>

      {loading && <p className="text-gray-300">読み込み中…</p>}
      {err && <p className="text-red-400">エラー: {err}</p>}

      {article && (
        <section className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 space-y-3">
          <h1 className="text-xl font-semibold text-white">{article.title}</h1>
          <p className="text-gray-200 whitespace-pre-wrap">
            {article.content ?? '（本文なし）'}
          </p>
        </section>
      )}

      {/* 回答フォーム */}
      <section className="rounded-xl border border-gray-700 bg-gray-800/30">
        <div className="border-b border-gray-700 px-5 py-3 text-sm text-gray-300">回答を投稿</div>
        <div className="px-5 py-4">
          <AnswerForm articleId={articleId} onDone={loadAnswers} />
        </div>
      </section>

      {/* 回答一覧 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">みんなの回答</h2>

        {answers.length === 0 && <p className="text-gray-400">まだ回答がありません</p>}

        {answers.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="mb-2 text-xs text-gray-400">回答ID: {a.id}</div>
            <div className="space-y-2">
              <div><span className="font-semibold text-gray-200">表現：</span>{a.phrase ?? '—'}</div>
              <div><span className="font-semibold text-gray-200">意味：</span>{a.meaning ?? '—'}</div>
              <div><span className="font-semibold text-gray-200">ニュアンス・使い方：</span>{a.nuance ?? '—'}</div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}