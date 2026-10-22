import React, { useState } from 'react';
import { Bell, Check, ChevronRight, LogOut, Mail, Moon, Save, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Profile({ user, onSave, onSignOut }) {
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || 'Workspace owner');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const save = (event) => {
    event.preventDefault();
    onSave({ ...user, name: name.trim() || 'Workspace owner', email: email.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return <div className="profile-page">
    <div className="profile-intro"><span className="form-kicker">PERSONAL SETTINGS</span><h2>Your profile</h2><p>Manage the details and preferences for your ChurnIQ workspace.</p></div>
    <section className="profile-hero content-card"><div className="profile-avatar-large">{initials}</div><div><span className="section-kicker">WORKSPACE OWNER</span><h3>{name || 'Your name'}</h3><p>{email}</p></div><span className="profile-secure"><ShieldCheck size={15} /> Local preview</span></section>
    <div className="profile-grid">
      <form className="content-card profile-settings" onSubmit={save}><div className="card-heading"><div><span className="section-kicker">ACCOUNT DETAILS</span><h3>Personal information</h3></div><UserRound size={19} className="profile-card-icon" /></div>
        <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input value={name} onChange={(e) => setName(e.target.value)} /></div></label>
        <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div></label>
        <div className="profile-readonly"><span>Workspace role</span><strong>Workspace owner</strong></div>
        <button className="primary-button profile-save" type="submit">{saved ? <Check size={16} /> : <Save size={16} />}{saved ? 'Saved' : 'Save changes'}</button>
      </form>
      <section className="content-card preferences-card"><div className="card-heading"><div><span className="section-kicker">PREFERENCES</span><h3>Make it yours</h3></div><Bell size={18} className="profile-card-icon" /></div>
        <button type="button" className="preference-row" onClick={toggleTheme}><span className="preference-symbol">{isDark ? <Moon size={17} /> : <Sun size={17} />}</span><span><strong>Appearance</strong><small>{isDark ? 'Dark theme' : 'Light theme'}</small></span><span className="preference-action">Change <ChevronRight size={15} /></span></button>
        <div className="preference-row preference-static"><span className="preference-symbol"><Bell size={17} /></span><span><strong>Notifications</strong><small>Workspace alerts</small></span><span className="coming-soon">Coming soon</span></div>
        <button type="button" className="signout-row" onClick={onSignOut}><LogOut size={17} /> Sign out of this device <ChevronRight size={15} /></button>
      </section>
    </div>
    <p className="profile-disclaimer"><ShieldCheck size={14} /> This app preview stores profile details in your browser. Connect a secure identity provider before using real accounts.</p>
  </div>;
}
