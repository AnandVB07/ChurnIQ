import React, { useState } from 'react';
import { Activity, ArrowRight, Mail, ShieldCheck, UsersRound } from 'lucide-react';

export default function Login({ onSignIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const enterWorkspace = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setError('Enter your name and a valid email to preview the workspace.');
      return;
    }
    setError('');
    onSignIn({ name: name.trim(), email: email.trim(), role: 'Workspace owner' });
  };

  return <main className="login-screen">
    <section className="login-story">
      <a href="#home" className="brand-lockup login-brand"><span className="brand-mark"><Activity size={20} /></span><span><strong>churn<span>iq</span></strong><small>RETENTION STUDIO</small></span></a>
      <div className="story-copy"><span className="eyebrow"><i className="eyebrow-dot" /> CUSTOMER INTELLIGENCE, MADE HUMAN</span><h1>Keep the customers<br />you worked hard to win.</h1><p>See the signals early. Make a thoughtful move. Give every customer a reason to stay.</p></div>
      <div className="retention-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" /><div className="orbit-core"><span><Activity size={31} /></span><small>RETENTION<br />PULSE</small></div><div className="orbit-node node-one"><UsersRound size={18} /></div><div className="orbit-node node-two"><ShieldCheck size={18} /></div><div className="orbit-node node-three"><span /></div></div>
      <div className="story-foot"><span>Built for thoughtful customer teams</span><span>01 <i /> 03</span></div>
    </section>
    <section className="login-panel"><div className="login-form-wrap">
      <div className="login-mobile-brand"><a className="brand-lockup" href="#home"><span className="brand-mark"><Activity size={19} /></span><span><strong>churn<span>iq</span></strong><small>RETENTION STUDIO</small></span></a></div>
      <span className="form-kicker">YOUR WORKSPACE, READY</span><h2>Welcome back</h2><p className="form-intro">Sign in to pick up where your customer team left off.</p>
      <form onSubmit={enterWorkspace}>
        <label className="field-label">Your name<div className="input-wrap"><UsersRound size={17} /><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" /></div></label>
        <label className="field-label">Work email<div className="input-wrap"><Mail size={17} /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@company.com" /></div></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="login-submit" type="submit">Continue to workspace <ArrowRight size={17} /></button>
      </form>
      <div className="login-note"><ShieldCheck size={16} /><span>Demo access needs no password; profile stays on this device.</span></div>
      <p className="login-legal">ChurnIQ workspace preview · Secure sign-in is not connected yet</p>
    </div></section>
  </main>;
}
