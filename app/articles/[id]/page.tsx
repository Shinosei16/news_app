'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QuestionForm from '../../_components/QuestionForm';
import AnswerForm from '../../_components/AnswerForm';

type Article = { id: string; title: string | null; url: string | null; created_at: string };

// 画面で使う“表示用”に絞った型（シンプル）
type QuestionView = {
  id: string;
  phrase: string | null;
  comment: string | null;
  created_at: string;
  userName: string | null;
};

type AnswerView = {
  id: string;
  question_id: string;
  phrase: string | null;
  meaning: string | null;
  nuance: string | null;
  created_at: string;
  userName: string | null;
};

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params は Promise なので unwrap
  const { id } = use(params);
  const supabase = createClientComponentClient();

  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<QuestionView[]>([]);
  const [answersByQ, setAnswersByQ] = useState<Record<string, AnswerView[]>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase が profiles(username) を配列で返すケースを吸収
  function pickName(p: any): string | null {
    if (!p) return null;
    if (Array.isArray(p)) return p[0]?.username ?? null;
    return p.username ?? null;
  }

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      // 記事
      const { data: a, error: e1 } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      if (e1) throw e1;
      setArticle(a as Article);

      // 質問（投稿者名を JOIN）
      const { data: qs, error: e2 } = await supabase
        .from('questions')
        .select('id, phrase, comment, created_at, profiles(username)')
        .eq('article_id', id)
        .order('created_at', { ascending: true });
      if (e2) throw e2;

      const qViews: QuestionView[] = (qs ?? []).map((q: any) => ({
        id: q.id,
        phrase: q.phrase ?? null,
        comment: q.comment ?? null,
        created_at: q.created_at,
        userName: pickName(q.profiles),
      }));
      setQuestions(qViews);

      // 回答（回答者名を JOIN）
      const qIds = qViews.map((q) => q.id);
      if (qIds.length) {
        const { data: ans, error: e3 } = await supabase
          .from('answers')
          .select('id, question_id, phrase, meaning, nuance, created_at, profiles(username)')
          .in('question_id', qIds)
          .order('created_at', { ascending: true });
        if (e3) throw e3;

        const grouped: Record<string, AnswerView[]> = {};
        for (const a of ans ?? []) {
          const av: AnswerView = {
            id: a.id,
            question_id: a.question_id,
            phrase: a.phrase ?? null,
            meaning: a.meaning ?? null,
            nuance: a.nuance ?? null,
            created_at: a.created_at,
            userName: pickName(a.profiles),
          };
          (grouped[av.question_id] ||= []).push(av);
        }
        setAnswersByQ(grouped);
      } else {
        setAnswersByQ({});
      }
    } catch (e: any) {
      setErr(e.message ?? '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // 投稿完了イベント（QuestionForm / AnswerForm が発火）
    const handler = () => load();
    window.addEventListener('qa:posted', handler as EventListener);
    return () => window.removeEventListener('qa:posted', handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main style={{ padding: 20 }}>
      <Link href="/" className="underline">{'< 戻る'}</Link>

      {loading && <p className="text-gray-400 mt-3">読み込み中…</p>}
      {err && <p className="text-red-400 mt-3">{err}</p>}

      {article && (
        <section className="mt-3">
          <div className="text-sm text-gray-400">Article ID: {article.id}</div>
          <h1 className="text-xl font-bold mt-1">{article.title ?? article.url}</h1>
          {article.url && (
            <Link href={article.url} target="_blank" className="underline">元記事を開く</Link>
          )}
        </section>
      )}

      {/* 質問フォーム */}
      <section className="mt-6 p-4 border border-gray-700 rounded-xl">
        <h2 className="font-semibold mb-2">この記事の「分からない」を投稿</h2>
        <QuestionForm articleId={id} />
      </section>

      {/* Q&A 一覧 */}
      <section className="mt-6">
        <h2 className="font-semibold mb-2">質問と回答</h2>

        {!questions.length && !loading && (
          <p className="text-gray-400 text-sm">まだ質問がありません</p>
        )}

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border border-gray-700 rounded-xl p-4">
              <div className="text-sm">
                <span className="font-semibold">Q：</span>
                {q.phrase || '—'}
              </div>
              {q.comment && (
                <div className="text-sm text-gray-300 mt-1">補足：{q.comment}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                by {q.userName ?? '（名無し）'}
              </div>

              {/* 回答一覧 */}
              <div className="mt-3 space-y-2">
                {(answersByQ[q.id] ?? []).map((a) => (
                  <div key={a.id} className="rounded-lg bg-gray-900 p-3 border border-gray-700">
                    <div className="text-sm">
                      <span className="font-semibold">表現：</span>{a.phrase ?? '—'}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">意味：</span>{a.meaning ?? '—'}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">ニュアンス・使い方：</span>{a.nuance ?? '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      by {a.userName ?? '（名無し）'}
                    </div>
                  </div>
                ))}
              </div>

              {/* 回答フォーム */}
              <div className="mt-3">
                <AnswerForm questionId={q.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}