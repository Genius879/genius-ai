import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bot, MessageCircle, Image as ImageIcon, Mic, Send, Sparkles, Menu, Plus, Volume2, LoaderCircle } from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8787';
function App() {
  const [tab, setTab] = useState('chat');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'नमस्ते! मैं Genius AI हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?' }]);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  async function request(path, body) {
    const response = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = path === '/api/speech' ? await response.blob() : await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
  async function sendChat(e) {
    e?.preventDefault(); const value = prompt.trim(); if (!value || busy) return;
    setMessages(m => [...m, { role: 'user', text: value }]); setPrompt(''); setBusy(true); setError('');
    try { const data = await request('/api/chat', { message: value }); setMessages(m => [...m, { role: 'assistant', text: data.text }]); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function makeImage(e) {
    e.preventDefault(); if (!prompt.trim() || busy) return; setBusy(true); setError(''); setImage('');
    try { const data = await request('/api/image', { prompt }); setImage(data.image); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function makeVoice(e) {
    e.preventDefault(); if (!prompt.trim() || busy) return; setBusy(true); setError('');
    try { const blob = await request('/api/speech', { text: prompt }); const url = URL.createObjectURL(blob); const audio = new Audio(url); await audio.play(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const tabs = [{ id: 'chat', label: 'AI Chat', icon: MessageCircle }, { id: 'image', label: 'Image Studio', icon: ImageIcon }, { id: 'voice', label: 'AI Voice', icon: Mic }];
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-icon"><Sparkles size={21}/></div><span>Genius <b>AI</b></span></div><button className="new-chat" onClick={() => {setMessages([{role:'assistant',text:'नमस्ते! मैं Genius AI हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?'}]);setTab('chat');setError('');}}><Plus size={17}/> New chat</button><div className="nav-label">WORKSPACE</div>{tabs.map(t => <button key={t.id} className={`nav-item ${tab===t.id?'active':''}`} onClick={()=>{setTab(t.id);setError('');}}><t.icon size={18}/>{t.label}</button>)}<div className="sidebar-bottom"><div className="avatar">G</div><div><strong>Genius AI</strong><small>Your AI workspace</small></div></div></aside>
    <main className="main"><header><button className="mobile-menu"><Menu/></button><div><div className="eyebrow">YOUR CREATIVE AI WORKSPACE</div><h1>{tab==='chat'?'AI Chat':tab==='image'?'Image Studio':'AI Voice'}</h1></div><div className="status"><span/> AI workspace</div></header>
      <section className="content">
        {tab==='chat' && <><div className="welcome"><div className="hero-icon"><Bot size={28}/></div><h2>What can I help you create?</h2><p>Ask questions, explore ideas, write, learn and build with Genius AI.</p><div className="suggestions">{['Write a YouTube video description','Explain a difficult topic simply','Give me creative app ideas'].map(x=><button onClick={()=>setPrompt(x)}>{x} <span>↗</span></button>)}</div></div><div className="messages">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==='assistant'?<Sparkles size={16}/>: 'You'}</div><div className="message-text">{m.text}</div></div>)}{busy&&<div className="message assistant"><div className="message-avatar"><Sparkles size={16}/></div><div className="message-text"><LoaderCircle className="spin" size={18}/> Thinking…</div></div>}</div><form className="composer" onSubmit={sendChat}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Message Genius AI…"/><button disabled={busy||!prompt.trim()} aria-label="Send"><Send size={18}/></button><small>Genius AI can make mistakes. Check important information.</small></form></>}
        {tab==='image' && <div className="tool-panel"><div className="tool-heading"><div className="hero-icon"><ImageIcon/></div><h2>Turn your ideas into images</h2><p>Describe the image you want Genius AI to create.</p></div><form className="tool-form" onSubmit={makeImage}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A beautiful futuristic city at sunset, cinematic lighting…"/><button disabled={busy||!prompt.trim()}>{busy?<LoaderCircle className="spin"/>:<Sparkles size={18}/>} Generate image</button></form>{image&&<img className="generated-image" src={image} alt="AI generated result"/>}</div>}
        {tab==='voice' && <div className="tool-panel"><div className="tool-heading"><div className="hero-icon"><Volume2/></div><h2>Give your words a voice</h2><p>Enter text and Genius AI will read it aloud.</p></div><form className="tool-form" onSubmit={makeVoice}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Type something you want Genius AI to speak…"/><button disabled={busy||!prompt.trim()}>{busy?<LoaderCircle className="spin"/>:<Mic size={18}/>} Generate voice</button></form></div>}
        {error&&<div className="error">{error}</div>}
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
