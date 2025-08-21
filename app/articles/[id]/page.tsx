'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qBody, setQBody] = useState('');

  const load = async () => {
    const { data: a } = await supabase.from('articles').select('*').eq('id', id).single();
    setArticle(a);
    const { data: qs } = await supabase
      .from('questions').select('*')
      .eq('article_id', id)
      .order('created_at', { ascending: true });
    setQuestions(qs || []);
  };

  useEffect(() => { load(); }, [id]);

  const postQuestion = async () => {
    if (!qBody.trim()) return;
    const { error } = await supabase.from('questions').insert({
      article_id: id, body: qBody.trim(), user_name: 'anon'
    });
    if (!error) { setQBody(''); load(); }
  };

  return (
    <main style={{ padding: 20 }}>
      {article && (
        <>
          <h1 style={{ fontWeight: 'bold' }}>{article.title || article.url}</h1>
          <a href={article.url} target="_blank" style={{ textDecoration: 'underline' }}>記事を開く</a>
        </>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>質問する</h3>
        <textarea
          value={qBody} onChange={e => setQBody(e.target.value)}
          rows={3} style={{ width: '100%', border: '1px solid #ddd', padding: 8 }}
          placeholder="わからないフレーズ・表現を書く"
        />
        <button onClick={postQuestion} style={{ marginTop: 8, padding: '6px 12px', border: '1px solid #333' }}>
          投稿
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>質問一覧</h3>
        {questions.map(q => <QuestionItem key={q.id} q={q} />)}
        {!questions.length && <p style={{ color: '#666' }}>まだ質問はありません</p>}
      </section>
    </main>
  );
}

function QuestionItem({ q }: { q: any }) {
  const [answers, setAnswers] = useState<any[]>([]);
  const [aBody, setABody] = useState('');

  const loadA = async () => {
    const { data } = await supabase
      .from('answers').select('*')
      .eq('question_id', q.id)
      .order('created_at', { ascending: true });
    setAnswers(data || []);
  };
  useEffect(() => { loadA(); }, [q.id]);

  const postA = async () => {
    if (!aBody.trim()) return;
    const { error } = await supabase.from('answers').insert({
      question_id: q.id, body: aBody.trim(), user_name: 'helper'
    });
    if (!error) { setABody(''); loadA(); }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, marginTop: 12 }}>
      <p style={{ whiteSpace: 'pre-wrap' }}>Q: {q.body}</p>

      <div style={{ marginTop: 8 }}>
        {answers.map(a => (
          <div key={a.id} style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 6, marginTop: 6 }}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>
          </div>
        ))}
        {!answers.length && <p style={{ color: '#999' }}>まだ回答はありません</p>}
      </div>

      <div style={{ marginTop: 8 }}>
        <textarea
          value={aBody} onChange={e => setABody(e.target.value)}
          rows={2} style={{ width: '100%', border: '1px solid #ddd', padding: 8 }}
          placeholder="回答を書く"
        />
        <button onClick={postA} style={{ marginTop: 6, padding: '6px 12px', border: '1px solid #333' }}>
          回答する
        </button>
      </div>
    </div>
  );
}