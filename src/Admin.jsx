import React, { useEffect, useState } from 'react';
import fallbackData from '../server/data.json';

const esc = s => s ?? '';
const tabs = [['site', 'Genel Ayarlar'], ['texts', 'Sayfa Metinleri'], ['categories', 'Menü Kategorileri'], ['products', 'Ürünler'], ['gallery', 'Fotoğraf Galerisi']];

const AC = React.createContext();
function Field({ k, l, type = 'text', area }) {
  const { D, setSite } = React.useContext(AC);
  return (<div><label>{l}</label>{area
    ? <textarea value={esc(D.site[k])} onChange={e => setSite(k, e.target.value)} />
    : <input type={type} value={esc(D.site[k])} onChange={e => setSite(k, type === 'number' ? +e.target.value : e.target.value)} />}</div>);
}
function Img({ k, l }) {
  const { D, setSite, upload } = React.useContext(AC);
  return (<div><label>{l}</label>{D.site[k] ? <img className="thumb" src={D.site[k]} alt="" /> : <div className="thumb" />}
    <button className="ab" onClick={() => upload(url => setSite(k, url))}>📤 Fotoğraf yükle</button>{D.site[k] && <button className="ab" onClick={() => setSite(k, '')}>Kaldır</button>}</div>);
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.at || '');
  const [D, setD] = useState(null);
  const [tab, setTab] = useState('site');
  const [err, setErr] = useState('');
  const [u, setU] = useState('admin'), [pw, setPw] = useState('');
  const [toast, setToast] = useState('');
  const [pf, setPf] = useState('');
  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  useEffect(() => {
    if (!token) return;
    fetch('/api/data')
      .then(r => (r.ok ? r.json() : fallbackData))
      .then(setD)
      .catch(() => setD(fallbackData));
  }, [token]);

  const login = async () => {
    setErr('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: u, pass: pw })
      });
      if (r.ok) {
        const j = await r.json();
        const t = j.token || 'asiyan-token';
        localStorage.at = t;
        setToken(t);
        return;
      }
    } catch (e) {
      // Vercel serverless fallback
    }

    // Client-side fallback doğrulama
    if (u === 'admin' && pw === 'asiyan123') {
      const t = 'asiyan-auth-token-valid';
      localStorage.at = t;
      setToken(t);
      return;
    }

    setErr('Hatalı giriş');
  };
  const save = async () => {
    const r = await fetch('/api/data', { method: 'PUT', headers: H, body: JSON.stringify(D) });
    if (r.status === 401) { alert('Oturum süresi doldu'); setToken(''); return; }
    setToast('Kaydedildi ✓'); setTimeout(() => setToast(''), 1800);
  };
  const upload = cb => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,video/mp4';
    i.onchange = () => {
      const f = i.files[0]; if (!f) return; const rd = new FileReader();
      rd.onload = async () => {
        const r = await fetch('/api/upload', { method: 'POST', headers: H, body: JSON.stringify({ name: f.name, data: rd.result }) });
        const j = await r.json(); j.url ? cb(j.url) : alert(j.error);
      };
      rd.readAsDataURL(f);
    };
    i.click();
  };

  // Yardımcılar: derin kopya üzerinde güncelleme
  const upd = fn => setD(d => { const n = JSON.parse(JSON.stringify(d)); fn(n); return n; });
  const mv = (key, i, dir) => upd(n => { const a = n[key], j = i + dir; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; });

  if (!token) return (
    <div className="adm"><div className="abox" style={{ maxWidth: 340, margin: '12vh auto' }}>
      <h2>Aşiyan Admin Girişi</h2>
      <label>Kullanıcı</label><input value={u} onChange={e => setU(e.target.value)} />
      <label>Şifre</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} /><br /><br />
      <button className="ab p" onClick={login}>Giriş</button> <span style={{ color: 'red' }}>{err}</span></div></div>);
  if (!D) return <div className="adm"><p style={{ padding: 30 }}>Yükleniyor…</p></div>;

  const setSite = (k, v) => upd(n => { n.site[k] = v; });
  const ctx = { D, setSite, upload };
  const views = {
    site: <>
      <div className="abox"><h3>Marka &amp; İletişim</h3><div className="ag">
        <Field k="name" l="Site adı" /><Field k="slogan" l="Slogan" /><Field k="phone1" l="Telefon 1" /><Field k="phone2" l="Telefon 2 (boş bırakılabilir)" />
        <Field k="instagram" l="Instagram kullanıcı adı" /><Field k="hours" l="Çalışma saatleri" /><Field k="branch" l="Şube etiketi" />
        <Field k="minCart" l="Min. sepet (TL)" type="number" /><Field k="delivery" l="Teslimat süresi" /><Field k="discount" l="Web indirimi (%)" type="number" />
        <Field k="googleAnalyticsId" l="Google Analytics Ölçüm Kimliği (G-XXXXXXXXXX)" /></div>
        <Field k="address" l="Adres / Konum (içinde 'henüz' geçerse harita gizlenir)" area /><Field k="payments" l="Ödeme yöntemleri" area />
        <div className="ag"><Img k="logo" l="Logo" /><Img k="heroImage" l="Anasayfa kapak fotoğrafı" /><Img k="menuBanner" l="Menü kapak fotoğrafı" /></div></div>
      <div className="abox"><h3>Kampanya Bandı</h3><Field k="promoTitle" l="Başlık" /><Field k="promoText" l="Açıklama" area /></div></>,
    texts: <>
      <div className="abox"><h3>Anasayfa Hero</h3><Field k="badge" l="Rozet" /><Field k="heroTitle" l="Başlık" /><Field k="heroItalic" l="İtalik başlık" /><Field k="heroText" l="Açıklama" area /></div>
      <div className="abox"><h3>Hakkımızda</h3><Field k="aboutTitle" l="Başlık" /><Field k="about1" l="Paragraf 1" area /><Field k="about2" l="Paragraf 2" area /><Img k="aboutImage" l="Hakkımızda fotoğrafı" />
        <Field k="venueTitle" l="Mekân başlığı" /><Field k="venueText" l="Mekân metni" area /><Field k="venueList" l="Mekân maddeleri (her satıra bir madde)" area /></div>
      <div className="abox"><h3>Üç Kural</h3>{D.site.rules.map((r, i) => <div className="ag" key={i}>
        <div><label>Başlık</label><input value={r.title} onChange={e => upd(n => { n.site.rules[i].title = e.target.value; })} /></div>
        <div><label>Metin</label><textarea value={r.text} onChange={e => upd(n => { n.site.rules[i].text = e.target.value; })} /></div></div>)}</div></>,
    categories: <div className="abox">
      {D.categories.map((c, i) => <div className="arow" key={c.id} style={{ marginBottom: 6 }}>
        <input style={{ flex: 1 }} value={c.name} onChange={e => upd(n => { n.categories[i].name = e.target.value; })} />
        <button className="ab" onClick={() => mv('categories', i, -1)}>↑</button><button className="ab" onClick={() => mv('categories', i, 1)}>↓</button>
        <button className="ab r" onClick={() => confirm('Silinsin mi?') && upd(n => { n.categories.splice(i, 1); })}>Sil</button></div>)}
      <br /><button className="ab p" onClick={() => upd(n => { n.categories.push({ id: 'c' + Date.now(), name: 'Yeni Kategori' }); })}>+ Kategori ekle</button></div>,
    products: <>
      <div className="arow" style={{ marginBottom: 10 }}>
        <button className="ab p" onClick={() => upd(n => { n.products.unshift({ id: 'p' + Date.now(), cat: n.categories[0]?.id, name: 'Yeni ürün', price: 0, desc: '', image: '', signature: false, featured: false, discount: true, active: true }); })}>+ Ürün ekle</button>
        <select style={{ width: 'auto' }} value={pf} onChange={e => setPf(e.target.value)}><option value="">Tüm kategoriler</option>{D.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {D.products.map((p, i) => ({ p, i })).filter(({ p }) => !pf || p.cat === pf).map(({ p, i }) => {
        const set = (k, v) => upd(n => { n.products[i][k] = v; });
        return <div className="abox pr" key={p.id}>
          <div>{p.image ? <img className="thumb" src={p.image} alt="" /> : <div className="thumb" />}<button className="ab" onClick={() => upload(url => set('image', url))}>📤</button></div>
          <div><div className="ag">
            <div><label>Ürün adı</label><input value={p.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label>Fiyat (TL)</label><input type="number" value={p.price} onChange={e => set('price', +e.target.value)} /></div>
            <div><label>Kategori</label><select value={p.cat} onChange={e => set('cat', e.target.value)}>{D.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
            <label>Açıklama / içindekiler</label><textarea value={p.desc} onChange={e => set('desc', e.target.value)} />
            <div className="arow">{[['active', 'Yayında'], ['signature', 'İmza lezzet'], ['featured', 'Öne çıkan'], ['discount', 'İndirim uygula']].map(([k, l]) =>
              <label key={k} style={{ display: 'inline' }}><input type="checkbox" checked={!!p[k]} onChange={e => set(k, e.target.checked)} /> {l}</label>)}
              <button className="ab r" style={{ marginLeft: 'auto' }} onClick={() => confirm('Ürün silinsin mi?') && upd(n => { n.products.splice(i, 1); })}>Sil</button></div></div></div>;
      })}</>,
    gallery: <>
      <div className="abox"><button className="ab p" onClick={() => upd(n => { n.gallery.push({ title: 'Yeni fotoğraf', image: '' }); })}>+ Fotoğraf ekle</button></div>
      <div className="ag">{D.gallery.map((g, i) => <div className="abox" key={i}>
        {g.image ? <img className="thumb" style={{ width: '100%', height: 140 }} src={g.image} alt="" /> : <div className="thumb" style={{ width: '100%', height: 140 }} />}
        <button className="ab" onClick={() => upload(url => upd(n => { n.gallery[i].image = url; }))}>📤 Yükle</button>
        <label>Başlık</label><input value={g.title} onChange={e => upd(n => { n.gallery[i].title = e.target.value; })} /><br />
        <div className="arow"><button className="ab" onClick={() => mv('gallery', i, -1)}>↑</button><button className="ab" onClick={() => mv('gallery', i, 1)}>↓</button>
          <button className="ab r" onClick={() => upd(n => { n.gallery.splice(i, 1); })}>Sil</button></div></div>)}</div></>
  };

  return (
    <AC.Provider value={ctx}><div className="adm">
      <header><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src="/uploads/restoranlogo.jpeg" alt="" style={{ height: 32, borderRadius: 6 }} /><b>Aşiyan Yönetim Paneli</b></div><span><a href="/" target="_blank" rel="noreferrer" style={{ color: '#fdba74' }}>Siteyi gör</a> &nbsp;
        <button className="ab p" onClick={save}>💾 Kaydet</button> <button className="ab" onClick={() => { localStorage.at = ''; setToken(''); }}>Çıkış</button></span></header>
      <nav>{tabs.map(([k, n]) => <button key={k} className={k === tab ? 'on' : ''} onClick={() => setTab(k)}>{n}</button>)}</nav>
      <main>{views[tab]}</main>
      {toast && <div className="toast">{toast}</div>}
    </div></AC.Provider>
  );
}

