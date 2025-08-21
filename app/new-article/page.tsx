'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NewArticle() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (!url) { setMsg('URL入れて'); return; }
    const { error } = await supabase.from('articles').insert({ url, title });
    if (error) { setMsg('エラー: ' + error.message); return; }
    setMsg('追加した！');
    setUrl(''); setTitle('');
  };

  return (
    <main style={{padding:20}}>
      <h1 style={{fontWeight:'bold'}}>記事を登録（運営）</h1>
      <input
        placeholder="記事URL"
        value={url}
        onChange={e=>setUrl(e.target.value)}
        style={{width:'100%',padding:8,marginTop:8,border:'1px solid #ddd'}}
      />
      <input
        placeholder="タイトル（任意）"
        value={title}
        onChange={e=>setTitle(e.target.value)}
        style={{width:'100%',padding:8,marginTop:8,border:'1px solid #ddd'}}
      />
      <button onClick={submit} style={{marginTop:12,padding:'8px 16px',border:'1px solid #333'}}>追加</button>
      <div style={{marginTop:8}}>{msg}</div>
    </main>
  );
}