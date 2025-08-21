'use client';
export const dynamic = 'force-dynamic';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { QuestionForm } from './QuestionForm';
import { AnswerForm } from './AnswerForm';

type Article = { id: number; title: string; url?: string | null; created_at?: string };
type Question = { id: number; phrase: string; comment?: string | null; created_at?: string };
type Answer = { id: number; question_id: number; phrase?: string | null; meaning?: string | null; nuance?: string | null; created_at?: string };

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const articleId = Number(id);

  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersByQ, setAnswersByQ] = useState<Record<number, Answer[]>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadArticle = useCallback(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, url, created_at')
      .eq('id', articleId)
      .single();
    if (error) throw new Error(error.message);
    setArticle(data);
  }, [articleId]);

  const loadQA = useCallback(async () => {
    const { data: qs, error: qErr } = await supabase
      .from('questions')
      .select('id, phrase, comment, created_at')
      .eq('article_id', articleId)
      .order('id', { ascending: false });
    if (qErr) throw new Error(qErr.message);

    const qIds = (qs ?? []).map(q => q.id);
    let ansBy: Record<number, Answer[]> = {};
    if (qIds.length) {
      const { data: ans, error: aErr } = await supabase
        .from('answers')
        .select('id, question_id, phrase, meaning, nuance, created_at')
        .in('question_id', qIds)
        .order('id', { ascending: false });
      if (aErr) throw new Error(aErr.message);
      for (const a of ans ?? []) {
        ansBy[a.question_id] ||= [];
        ansBy[a.question_id].push(a);
      }
    }
    setQuestions(qs ?? []);
    setAnswersByQ(ansBy);
  }, [articleId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr(null);
        await Promise.all([loadArticle(), loadQA()]);
      } catch (e: any) { setErr(e.message ?? '読み込みに失敗しました'); }
      finally { setLoading(false); }
    })();
  }, [loadArticle, loadQA]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-blue-400 hover:underline">{'<'} 戻る</Link>
        <span className="text-xs text-gray-400">Article ID: {articleId}</span>
      </div>

      {loading && <p className="text-gray-300">読み込み中…</p>}
      {err && <p className="text-red-400">エラー: {err}</p>}

      {article && (
        <section className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 space-y-2">
          <h1 className="text-xl font-semibold text-white">{article.title}</h1>
          {article.url && (
            <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-400 underline text-sm">
              元記事を開く
            </a>
          )}
        </section>
      )}

      {/* 質問投稿 */}
      <section className="rounded-xl border border-gray-700 bg-gray-800/30">
        <div className="border-b border-gray-700 px-5 py-3 text-sm text-gray-300">この記事の「分からない」を投稿</div>
        <div className="px-5 py-4">
          <QuestionForm articleId={articleId} onDone={loadQA} />
        </div>
      </section>

      {/* 質問一覧 + 回答 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">質問と回答</h2>
        {questions.length === 0 && <p className="text-gray-400">まだ質問がありません</p>}

        {questions.map(q => (
          <div key={q.id} className="rounded-xl border border-gray-700 bg-gray-800/30 p-4 space-y-3">
            <div className="text-sm">
              <span className="font-semibold text-gray-200">フレーズ：</span>{q.phrase}
            </div>
            {q.comment && <div className="text-sm text-gray-300">補足：{q.comment}</div>}

            <div className="space-y-2">
              {(answersByQ[q.id] ?? []).map(a => (
                <div key={a.id} className="rounded-lg border border-gray-700 bg-gray-900/40 p-3">
                  <div><span className="font-semibold text-gray-200">表現：</span>{a.phrase ?? '—'}</div>
                  <div><span className="font-semibold text-gray-200">意味：</span>{a.meaning ?? '—'}</div>
                  <div><span className="font-semibold text-gray-200">ニュアンス・使い方：</span>{a.nuance ?? '—'}</div>
                </div>
              ))}
              {/* 回答フォーム（質問ごと） */}
              <AnswerForm questionId={q.id} onDone={loadQA} />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}