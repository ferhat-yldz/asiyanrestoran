import React, { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Link, NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import fallbackData from '../server/data.json';

const Ctx = createContext();
const useApp = () => useContext(Ctx);
const tl = n => n.toLocaleString('tr-TR') + '₺';
const bgs = u => (u ? { backgroundImage: `url('${u}')` } : {});
const noLoc = a => !a || a.toLowerCase().includes('henüz');

const I18N = {
  tr: {
    home: 'Anasayfa',
    menu: 'Menü',
    about: 'Hakkımızda',
    gallery: 'Galeri',
    contact: 'İletişim',
    exploreMenu: 'Menüyü İncele',
    getDirections: 'Konuma Git',
    hoursLabel: 'Çalışma saatleri',
    serviceLabel: 'Özenli servis',
    menuLabel: 'Zengin menü',
    searchPlaceholder: 'Menüde lezzet ara...',
    all: 'Tümü',
    noProduct: 'Ürün bulunamadı.',
    searchTitle: 'Lezzet Arayın',
    searchHint: 'Kebap, meze, tatlı veya içecek arayın...',
    followInstagram: 'Instagram\'da Takip Et',
    seeAllInstagram: 'Instagram\'da Tümünü Gör',
    reviews: 'Misafir Yorumları',
    whatTheySay: 'Misafirlerimiz ne diyor?',
    googleReviews: 'Google\'da yorumları gör',
    infoTitle: 'Restoran Bilgileri',
    tabHours: 'Çalışma Saatleri',
    tabPayments: 'Ödeme Yöntemleri',
    tabAddress: 'Adres & Konum',
    openNow: 'Şu an açığız',
    discover: 'Keşfedin',
    reachUs: 'Bize Ulaşın',
    signatureTitle: 'İmza Lezzetler',
    signatureSub: 'Ateşin en sevilen hâli',
    signatureDesc: 'İmza kebaplarımızı inceleyin, sofranızın tadını çıkarın.',
    exploreTitle: 'Keşfet',
    exploreSub: 'Bugün canınız ne çekiyor?',
    exploreDesc: 'Kebaplardan dürümlere, fırın lezzetlerinden tatlılara.',
    allMenuBtn: 'Tüm Menüyü Gör',
    sweetTitle: 'Sofranın tatlı tarafı',
    sweetSub: 'Asya Katmeri deneyin.',
    sweetDesc: 'Yemeğin ardından tatlı bir mola.',
    sweetBtn: 'Katmer çeşitlerini gör',
    band1Title: 'Acıktınız mı? Közü yaktık.',
    band1Desc: 'Zengin menümüzü inceleyin, enfes lezzetlerimizi keşfedin.',
    band2Title: 'Bugün sofranızda Aşiyan olsun',
    band2Desc: 'Menüyü inceleyin, enfes Adana kebaplarımızı keşfedin.',
    searchBtn: 'Ara'
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    about: 'About Us',
    gallery: 'Gallery',
    contact: 'Contact',
    exploreMenu: 'Explore Menu',
    getDirections: 'Get Directions',
    hoursLabel: 'Working hours',
    serviceLabel: 'Attentive service',
    menuLabel: 'Rich menu',
    searchPlaceholder: 'Search dishes in menu...',
    all: 'All',
    noProduct: 'No dishes found.',
    searchTitle: 'Search Dish',
    searchHint: 'Search kebab, mezze, dessert or beverage...',
    followInstagram: 'Follow on Instagram',
    seeAllInstagram: 'See All on Instagram',
    reviews: 'Guest Reviews',
    whatTheySay: 'What our guests say',
    googleReviews: 'View reviews on Google',
    infoTitle: 'Restaurant Information',
    tabHours: 'Opening Hours',
    tabPayments: 'Payment Methods',
    tabAddress: 'Address & Location',
    openNow: 'Open now',
    discover: 'Discover',
    reachUs: 'Contact Us',
    signatureTitle: 'Signature Dishes',
    signatureSub: 'The Finest Form of Fire',
    signatureDesc: 'Explore our signature kebabs and enjoy your feast.',
    exploreTitle: 'Explore',
    exploreSub: 'What are you craving today?',
    exploreDesc: 'From kebabs to wraps, stone oven specials to desserts.',
    allMenuBtn: 'View Full Menu',
    sweetTitle: 'Sweet Side of the Table',
    sweetSub: 'Try Our Authentic Katmer',
    sweetDesc: 'A delightful dessert break after the feast.',
    sweetBtn: 'Explore Katmer Specials',
    band1Title: 'Hungry? The embers are burning.',
    band1Desc: 'Browse our rich menu and discover authentic flavours.',
    band2Title: 'Let Aşiyan grace your table today',
    band2Desc: 'Explore our menu and discover delicious Adana kebabs.',
    searchBtn: 'Search'
  }
};

function Card({ p }) {
  const { price, setModal } = useApp();
  const pr = price(p);
  const detail = () => setModal({ type: 'product', p });
  return (
    <div className="card" onClick={detail} style={{ cursor: 'pointer' }}>
      <div className="ph">{p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : '🍖'}</div>
      <div className="bd">
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        <div className="price" style={{ marginTop: 'auto', paddingTop: 8 }}>
          {pr !== p.price && <s>{tl(p.price)}</s>}
          <b>{tl(pr)}</b>
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, title, sub, items, children }) {
  if (!items.length) return null;
  return (
    <section className="sec">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p className="sub">{sub}</p>
      <div className="grid">{items.map(p => <Card key={p.id} p={p} />)}</div>
      {children}
    </section>
  );
}

const PageHero = ({ title, bgImage }) => {
  const { D } = useApp();
  const bg = bgImage ? { backgroundImage: `url('${bgImage}')` } : {};
  return (
    <section className="page-hero" style={bg}>
      <div>
        <span className="badge">• {D.site.name.toUpperCase()}</span>
        <h1>{title}</h1>
        <p>{D.site.slogan}</p>
      </div>
    </section>
  );
};

const Cta = ({ title, text, children }) => (
  <div className="band">
    <h2>{title}</h2>
    <p>{text}</p>
    <div className="row" style={{ justifyContent: 'center' }}>{children}</div>
  </div>
);

const Gimg = ({ g }) => (g.image ? <img src={g.image} alt={g.title} /> : g.title);

function Home() {
  const { D, active, t } = useApp();
  const s = D.site, A = active();
  const heroImages = (s.heroImages && s.heroImages.length > 0)
    ? s.heroImages
    : (s.heroImage ? [s.heroImage] : ['/uploads/asiyan-anasayfa.png', '/uploads/pirzola-kusbasi-karisik.png']);

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [heroImages]);

  return (
    <>
      <section className="hero">
        <div className="hero-slider">
          {heroImages.map((imgUrl, i) => (
            <div
              key={i}
              className={`hero-slide ${i === slide ? 'active' : ''}`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
        </div>
        <div className="hero-content">
          <span className="badge">• {s.badge}</span>
          <h1>{s.heroTitle} <i>{s.heroItalic}</i></h1>
          <p>{s.heroText}</p>
          <div className="row">
            <Link className="btn pri big" to="/menu">{t.exploreMenu}</Link>
            <Link className="btn ghost big" to="/iletisim">{t.getDirections}</Link>
          </div>
          <div className="row pills">
            <span>{t.hoursLabel}: {s.hours}</span>
            <span>{t.serviceLabel}</span>
            <span>{t.menuLabel}</span>
          </div>
        </div>
      </section>

      <Section eyebrow={t.signatureTitle} title={t.signatureSub} sub={t.signatureDesc} items={A.filter(p => p.signature)} />

      <section className="sec">
        <div className="eyebrow">{t.exploreTitle}</div>
        <h2>{t.exploreSub}</h2>
        <p className="sub">{t.exploreDesc}</p>
        <div className="cats">
          {D.categories.map(c => <Link key={c.id} className="cat" to={`/menu/${c.id}`}>{c.name}</Link>)}
        </div>
      </section>

      <Section eyebrow={t.menu} title="Menüden Seçtiklerimiz" sub="" items={A.filter(p => p.featured)}>
        <p style={{ textAlign: 'center', marginTop: 24 }}>
          <Link className="btn pri" to="/menu">{t.allMenuBtn}</Link>
        </p>
      </Section>

      <Section eyebrow={t.sweetTitle} title={t.sweetSub} sub={t.sweetDesc} items={A.filter(p => p.cat === 'katmer')}>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" to="/menu/katmer">{t.sweetBtn}</Link>
        </p>
      </Section>

      <Cta title={t.band1Title} text={t.band1Desc}>
        <Link className="btn pri big" to="/menu">{t.menu}</Link>
      </Cta>

      <section className="sec">
        <div className="eyebrow">@ · {s.instagram}</div>
        <h2>Aşiyan'da bugün ne pişiyor?</h2>
        <div className="gal">
          {D.gallery.slice(0, 6).map((g, i) => <figure key={i}><Gimg g={g} /></figure>)}
        </div>
        <p style={{ marginTop: 14 }}>
          <a className="btn" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${s.instagram}/`}>{t.followInstagram}</a>
        </p>
      </section>

      <section className="sec">
        <div className="eyebrow">{t.reviews}</div>
        <h2>{t.whatTheySay}</h2>
        <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + ' Adana')}`}>{t.googleReviews}</a>
      </section>

      <Cta title={t.band2Title} text={t.band2Desc}>
        <Link className="btn pri big" to="/menu">{t.exploreMenu}</Link>
        <Link className="btn ghost big" to="/iletisim">{t.getDirections}</Link>
      </Cta>
    </>
  );
}

function Menu() {
  const { D, active, t } = useApp();
  const { cat = '' } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQ = searchParams.get('q') || '';
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    setQ(query);
  }, [location.search]);

  const list = active().filter(p => (!cat || p.cat === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHero title={t.menu} bgImage={D.site.menuBanner || '/uploads/menu-banner.png'} />
      <div className="bar">
        <input placeholder={t.searchPlaceholder} value={q} onChange={e => setQ(e.target.value)} />
        <div className="tabs">
          {[{ id: '', name: t.all }, ...D.categories].map(c => (
            <Link key={c.id} to={c.id ? `/menu/${c.id}` : '/menu'}>
              <button className={c.id === cat ? 'on' : ''}>{c.name}</button>
            </Link>
          ))}
        </div>
      </div>
      <section className="sec">
        <div className="grid">
          {list.map(p => <Card key={p.id} p={p} />)}
        </div>
        {!list.length && <p>{t.noProduct}</p>}
      </section>
    </>
  );
}

function About() {
  const { D, t } = useApp();
  const s = D.site;
  const pic = s.aboutImage ? <img src={s.aboutImage} alt="" /> : <div className="imgph" />;

  return (
    <>
      <PageHero title={t.about} />
      <section className="sec two">
        <div>
          <div className="eyebrow">Hikâyemiz</div>
          <h2>{s.aboutTitle}</h2>
          <p>{s.about1}</p>
          <br />
          <p>{s.about2}</p>
          <div className="stats">
            <div><b>2026</b>Kuruluş yılı</div>
            <div><b>%100</b>Yerli besi kuzu eti</div>
            <div><b>Her Gün</b>Taze hazırlanan mezeler</div>
          </div>
        </div>
        {pic}
      </section>

      <section className="sec">
        <div className="eyebrow">Özenle çalışıyoruz</div>
        <h2>Değişmeyen üç kuralımız</h2>
        <div className="three">
          {s.rules.map((r, i) => (
            <div className="card" key={i}>
              <div className="bd">
                <h3>{r.title}</h3>
                <p style={{ WebkitLineClamp: 'unset' }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec two">
        {pic}
        <div>
          <div className="eyebrow">Mekân &amp; Deneyim</div>
          <h2>{s.venueTitle}</h2>
          <p>{s.venueText}</p>
          <ul className="chk">
            {s.venueList.split('\n').map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      </section>

      <Cta title="Közün sıcaklığını sofranızda hissedin" text="Menümüzü inceleyin veya bizi ziyaret edin. Sofranız hazır.">
        <Link className="btn pri big" to="/menu">{t.exploreMenu}</Link>
        <Link className="btn ghost big" to="/iletisim">{t.contact}</Link>
      </Cta>
    </>
  );
}

function Gallery() {
  const { D, setModal, t } = useApp();
  return (
    <>
      <PageHero title={t.gallery} />
      <section className="sec">
        <div className="gal">
          {D.gallery.map((g, i) => (
            <figure key={i} onClick={() => setModal({ type: 'photo', g })}>
              <Gimg g={g} />
            </figure>
          ))}
        </div>
        <p style={{ marginTop: 14 }}>
          <a className="btn" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${D.site.instagram}/`}>{t.seeAllInstagram}</a>
        </p>
      </section>
    </>
  );
}

function Contact() {
  const { D, t } = useApp();
  const s = D.site;
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  return (
    <>
      <PageHero title={t.contact} />
      <section className="sec two" style={{ alignItems: 'stretch' }}>
        <div className="info">
          <h3>{t.infoTitle}</h3>
          <p>📍 {s.address}</p>
          <p>📷 <a target="_blank" rel="noreferrer" href={`https://www.instagram.com/${s.instagram}/`}>@{s.instagram}</a></p>
          <h4 style={{ marginTop: 16 }}>{t.tabHours}</h4>
          <table>
            <tbody>
              {days.map(d => <tr key={d}><td>{d}</td><td>{s.hours}</td></tr>)}
            </tbody>
          </table>
          <br />
          <Link className="btn pri" to="/menu">{t.exploreMenu}</Link>
        </div>
        <div className="info" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', minHeight: 300 }}>
          {noLoc(s.address) ? (
            <div>
              <div style={{ fontSize: 48 }}>📍</div>
              <h3>Konum henüz eklenmedi</h3>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <iframe title="Konum" src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`} />
              <p style={{ marginTop: 10 }}>
                <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}`}>Google Haritalar'da Aç</a>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SearchModal({ close }) {
  const { t, active, price } = useApp();
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const results = term.trim()
    ? active().filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.desc.toLowerCase().includes(term.toLowerCase()))
    : [];

  const handleGo = (cat) => {
    navigate(cat ? `/menu/${cat}` : '/menu');
    close();
  };

  return (
    <div id="modal" className="on" onClick={e => e.target.id === 'modal' && close()}>
      <div className="mbox search-mbox">
        <button className="x" onClick={close}>✕</button>
        <div className="search-header">
          <h3>🔍 {t.searchTitle}</h3>
          <p className="sub" style={{ marginBottom: 12 }}>{t.searchHint}</p>
          <div className="search-input-wrap">
            <input
              autoFocus
              className="fi"
              placeholder={t.searchPlaceholder}
              value={term}
              onChange={e => setTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && term.trim()) {
                  navigate(`/menu?q=${encodeURIComponent(term.trim())}`);
                  close();
                }
              }}
            />
            {term && (
              <button
                className="btn pri"
                style={{ position: 'absolute', right: 8, top: 12, padding: '7px 16px' }}
                onClick={() => {
                  navigate(`/menu?q=${encodeURIComponent(term.trim())}`);
                  close();
                }}
              >
                {t.searchBtn}
              </button>
            )}
          </div>
        </div>

        <div className="search-results">
          {term.trim() && !results.length && (
            <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--mut)' }}>{t.noProduct}</p>
          )}
          {results.slice(0, 6).map(p => (
            <div
              key={p.id}
              className="search-item"
              onClick={() => handleGo(p.cat)}
            >
              <div className="search-item-img">{p.image ? <img src={p.image} alt={p.name} /> : '🍖'}</div>
              <div className="search-item-info">
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
              </div>
              <div className="search-item-price">
                <b>{tl(price(p))}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Modal({ m, close }) {
  const { D, price, t } = useApp();
  const s = D.site;
  const [tab, setTab] = useState(m.tab || 0);
  if (!m) return null;

  let body;
  if (m.type === 'product') {
    const p = m.p, pr = price(p);
    body = (
      <>
        {p.image && <img src={p.image} alt="" />}
        <h2>{p.name}</h2>
        <p>{p.desc}</p>
        <div className="price" style={{ margin: '14px 0' }}>
          {pr !== p.price && <s>{tl(p.price)}</s>}
          <b>{tl(pr)}</b>
        </div>
      </>
    );
  } else if (m.type === 'photo') {
    body = (
      <>
        {m.g.image && <img src={m.g.image} alt="" />}
        <h3>{m.g.title}</h3>
      </>
    );
  } else {
    const T_arr = [
      <p><span className="dot" />Haftanın her günü {s.hours}</p>,
      <p>{s.payments}</p>,
      <p>📍 {s.address}</p>
    ];
    body = (
      <>
        <h2>{t.infoTitle}</h2>
        <div className="row mtabs">
          {[t.tabHours, t.tabPayments, t.tabAddress].map((n, i) => (
            <button key={n} className={'btn' + (i === tab ? ' pri' : '')} onClick={() => setTab(i)}>{n}</button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>{T_arr[tab]}</div>
      </>
    );
  }

  return (
    <div id="modal" className="on" onClick={e => e.target.id === 'modal' && close()}>
      <div className="mbox">
        <button className="x" onClick={close}>✕</button>
        {body}
      </div>
    </div>
  );
}

export default function App() {
  const [D, setD] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(!!localStorage.dark);
  const [lang, setLang] = useState(() => {
    if (typeof document !== 'undefined' && document.cookie.includes('/tr/en')) return 'en';
    return localStorage.lang || 'tr';
  });
  const loc = useLocation();

  const triggerGoogleTranslate = (targetLang) => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
    }
    document.cookie = `googtrans=/tr/${targetLang}; path=/`;
    document.cookie = `googtrans=/tr/${targetLang}; path=/; domain=${window.location.hostname}`;
  };

  const switchLang = () => {
    const next = lang === 'tr' ? 'en' : 'tr';
    setLang(next);
    triggerGoogleTranslate(next);
  };

  useEffect(() => {
    // Sayfa yüklendiğinde dil tercihi İngilizce ise Google Translate'i devreye al
    if (lang === 'en') {
      const timer = setTimeout(() => triggerGoogleTranslate('en'), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetch('/api/data')
      .then(r => (r.ok ? r.json() : fallbackData))
      .then(setD)
      .catch(() => setD(fallbackData));
  }, []);
  useEffect(() => { document.body.classList.toggle('dark', dark); localStorage.dark = dark ? '1' : ''; }, [dark]);
  useEffect(() => { localStorage.lang = lang; }, [lang]);
  useEffect(() => { setDrawer(false); setModal(null); setSearchOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    if (D?.site?.googleAnalyticsId && typeof window.loadGA === 'function') {
      window.loadGA(D.site.googleAnalyticsId);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: loc.pathname + loc.search,
          page_title: document.title
        });
      }
    }
  }, [loc.pathname, D?.site?.googleAnalyticsId]);

  useEffect(() => { if (D) document.title = D.site.name; }, [D]);

  if (!D) return <p style={{ padding: 40 }}>Yükleniyor…</p>;

  const s = D.site;
  const t = I18N[lang] || I18N.tr;
  const price = p => (s.discount && p.discount ? Math.round(p.price * (100 - s.discount) / 100) : p.price);
  const active = () => D.products.filter(p => p.active !== false);
  const logoSrc = '/uploads/restoranlogo.jpeg';

  const navs = [
    ['/', t.home],
    ['/menu', t.menu],
    ['/hakkimizda', t.about],
    ['/galeri', t.gallery],
    ['/iletisim', t.contact]
  ];

  return (
    <Ctx.Provider value={{ D, price, active, setModal, lang, t }}>
      <header className="hdr">
        <Link to="/" className="brand">
          <img src={logoSrc} alt={s.name} className="brand-logo-img" />
          <span className="brand-text">AŞİYAN RESTORAN</span>
        </Link>

        <nav className="nav">
          {navs.map(([to, n]) => <NavLink key={to} to={to} end={to === '/'}>{n}</NavLink>)}
        </nav>

        <div className="hact">
          <button className="ic search-btn" onClick={() => setSearchOpen(true)} title={t.searchTitle}>
            🔍
          </button>
          <button className="ic theme-btn" onClick={() => setDark(!dark)} title={dark ? 'Açık Tema' : 'Karanlık Tema'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            className="lang-pill"
            onClick={switchLang}
            title="Dili Değiştir / Change Language"
          >
            <span className={lang === 'tr' ? 'active-lang' : ''}>TR</span>
            <span className="lang-sep">|</span>
            <span className={lang === 'en' ? 'active-lang' : ''}>EN</span>
          </button>
          <button className="ic burger" onClick={() => setDrawer(true)} title="Menüyü aç">☰</button>
        </div>
      </header>

      <div className={'drawer left' + (drawer ? ' on' : '')}>
        <button className="x" onClick={() => setDrawer(false)}>✕</button>
        <div id="mobNav">
          <div style={{ marginBottom: 16 }}>
            <img src={logoSrc} alt={s.name} style={{ height: 48, borderRadius: 8 }} />
          </div>
          {navs.map(([to, n]) => <Link key={to} to={to}>{n}</Link>)}
          <h4 style={{ margin: '16px 0 4px' }}>Menü Kategorileri</h4>
          {D.categories.map(c => <Link key={c.id} to={`/menu/${c.id}`}>{c.name}</Link>)}
        </div>
      </div>
      <div id="veil" className={drawer ? 'on' : ''} onClick={() => setDrawer(false)} />
      {modal && <Modal m={modal} close={() => setModal(null)} />}
      {searchOpen && <SearchModal close={() => setSearchOpen(false)} />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:cat" element={<Menu />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/galeri" element={<Gallery />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer>
        <div className="cols">
          <div>
            <div className="footer-brand">
              <img src={logoSrc} alt={s.name} className="footer-logo-img" />
              <h4>{s.name}</h4>
            </div>
            <p>{s.slogan}</p>
            <a target="_blank" rel="noreferrer" href={`https://www.instagram.com/${s.instagram}/`}>Instagram</a>
          </div>
          <div>
            <h4>{t.discover}</h4>
            {navs.map(([to, n]) => <Link key={to} to={to}>{n}</Link>)}
          </div>
          <div>
            <h4>{t.infoTitle}</h4>
            <a href="#" onClick={e => { e.preventDefault(); setModal({ type: 'info', tab: 0 }); }}>{t.tabHours}</a>
            <a href="#" onClick={e => { e.preventDefault(); setModal({ type: 'info', tab: 1 }); }}>{t.tabPayments}</a>
            <a href="#" onClick={e => { e.preventDefault(); setModal({ type: 'info', tab: 2 }); }}>{t.tabAddress}</a>
          </div>
          <div>
            <h4>{t.reachUs}</h4>
            <p>{s.address}</p>
            <p>{s.branch}</p>
            <p><span className="dot" />{t.openNow} · {s.hours}</p>
          </div>
        </div>
        <div className="cp">© 2026 {s.name}. {t.copyright}</div>
      </footer>
    </Ctx.Provider>
  );
}
