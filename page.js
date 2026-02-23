'use client'

import { useState, useEffect } from 'react'

// ─── DATA ──────────────────────────────────────────────
const POSTS = [
  {
    id: 1, cat: 'watches',
    author: 'Marcus Lindqvist', avatar: 'M', avClass: 'av-a', trusted: true,
    location: 'Stockholm', time: '3h', icon: '⌚',
    title: 'Submariner. 30 years. Every country I\'ve been to.',
    caption: 'The bezel faded in Patagonia. The crown chipped in Morocco. That\'s the whole story, right there on your wrist.',
    character: 'Rolex ref. 1680 · tropical ghost bezel · crown chip, Morocco 2009 · cream lume · original bracelet',
    likes: 47, comments: 12, forSale: false,
  },
  {
    id: 2, cat: 'cars',
    author: 'Eleanor Braun', avatar: 'E', avClass: 'av-b', trusted: false,
    location: 'Munich', time: '1d', icon: '🚗',
    title: '1974 BMW 2002 tii. Munich to Istanbul. Original paint.',
    caption: 'Family car since 1979. Not restored — preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.',
    character: 'Inka Orange · matching numbers · original Sahara Beige interior · 127,000km · no respray',
    likes: 89, comments: 24, forSale: true, price: 'EUR 38,500',
  },
  {
    id: 3, cat: 'pens',
    author: 'Hamish Mackay', avatar: 'H', avClass: 'av-c', trusted: true,
    location: 'Edinburgh', time: '2d', icon: '✒️',
    title: 'Thirty years. One nib. Shaped entirely to my hand.',
    caption: 'My father\'s Montblanc 149. The nib oblique from three decades of daily use. No other writer would find it comfortable. That is the point.',
    character: 'Montblanc 149 · sprung oblique medium nib · brass showing on clip · cap micro-scratched · 1994',
    likes: 134, comments: 31, forSale: false,
  },
  {
    id: 4, cat: 'cameras',
    author: 'Eleanor Braun', avatar: 'E', avClass: 'av-b', trusted: false,
    location: 'Munich', time: '3d', icon: '📷',
    title: 'Leica M3 DS, 1956. Brassed, honest, shooting beautifully.',
    caption: 'Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on. A camera with a good life — looking for its next chapter.',
    character: 'Leica M3 double stroke · 1956 · natural brassing · original vulcanite · RF bright and accurate',
    likes: 56, comments: 9, forSale: true, price: 'EUR 2,400',
  },
  {
    id: 5, cat: 'boats',
    author: 'Sofia Andersen', avatar: 'S', avClass: 'av-d', trusted: false,
    location: 'Bergen', time: '4d', icon: '⛵',
    title: '1968 Hallberg-Rassy 35. The teak is original. Silver-grey.',
    caption: 'The cockpit repair is from a knockdown off Shetland in 2004. I show everyone that repair first. It is the best part of the boat.',
    character: 'Original teak deck · silver-patinated · cockpit repair 2004 (structural) · verdigris bronze fittings',
    likes: 62, comments: 18, forSale: false,
  },
]

const LISTINGS = [
  { id: 1, cat: 'watches', icon: '⌚', label: '⌚ Watches · For Sale', title: 'Rolex Oyster Perpetual 36 — 14 years daily', char: 'White dial hairline at 6 o\'clock — acquired reaching for keys in a quarry, 2018. Original bracelet, stretched and beautiful.', price: 'CHF 6,800', seller: 'Marcus L.', rep: '4.97', avClass: 'av-a', avLetter: 'M', wanted: false },
  { id: 2, cat: 'cars', icon: '🚗', label: '🚗 Cars · For Sale', title: '1974 BMW 2002 tii — Istanbul survivor', char: 'Original Inka Orange, Munich to Istanbul 1982. Small dent rear quarter from that journey. Matching numbers. No respray.', price: 'EUR 38,500', seller: 'Eleanor B.', rep: '4.88', avClass: 'av-b', avLetter: 'E', wanted: false },
  { id: 3, cat: 'cameras', icon: '📷', label: '📷 Cameras · For Sale', title: 'Leica M3 Double Stroke, 1956 — user grade, honest', char: 'Brassing to all edges from genuine use. Vulcanite has warm, worn feel. Rangefinder bright and accurate. A camera with a good life.', price: 'EUR 2,400', seller: 'Hamish M.', rep: '5.00', avClass: 'av-c', avLetter: 'H', wanted: false },
  { id: 4, cat: 'pens', icon: '✒️', label: '✒️ Pens · Wanted', title: 'Seeking: Parker 51 Aerometric — user grade', char: 'Not looking for NOS or mint — looking for one that has been loved and written with for years. A pen with a story.', price: 'Budget: £180', seller: 'Sofia A.', rep: '4.92', avClass: 'av-d', avLetter: 'S', wanted: true },
  { id: 5, cat: 'boats', icon: '⛵', label: '⛵ Boats · For Sale', title: '1968 Hallberg-Rassy 35 — North Sea veteran', char: 'Original teak deck, silver-grey. Cockpit repair from 2004 knockdown off Shetland — visible, structural, honest. Part of the story.', price: 'NOK 680,000', seller: 'Sofia A.', rep: '4.92', avClass: 'av-d', avLetter: 'S', wanted: false },
  { id: 6, cat: 'watches', icon: '⌚', label: '⌚ Watches · For Sale', title: 'IWC Portugieser 7-Day ref. 5001 — 11 years daily', char: 'Case has acquired beautiful satin finish from daily wear. Dial is remarkably clean for its age. A proper companion watch.', price: 'CHF 9,200', seller: 'Eleanor B.', rep: '4.88', avClass: 'av-b', avLetter: 'E', wanted: false },
]

const TICKER_ITEMS = [
  'The scratch that tells the story','Not a trophy — a companion','Worn daily, loved deeply',
  'Provenance is a life lived','Against the unboxed and undriven','A thousand mornings with the same watch',
  'The nib shaped by one hand','The teak silvered by a thousand crossings',
]

// ─── MODAL ────────────────────────────────────────────
function Modal({ id, title, sub, children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="m-ov open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="m-title">{title}</div>
        <div className="m-sub">{sub}</div>
        {children}
      </div>
    </div>
  )
}

// ─── TOPBAR ───────────────────────────────────────────
function TopBar({ onJoin, onSignIn }) {
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(d.toLocaleDateString('en-AU', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) + ' · Sydney, Australia')
  }, [])

  return (
    <div className="topbar">
      <div className="topbar-l">{dateStr}</div>
      <div className="topbar-r">
        <a href="#" onClick={(e) => { e.preventDefault(); onSignIn() }}>Sign In</a>
        <a href="#" className="t-join" onClick={(e) => { e.preventDefault(); onJoin() }}>Request Membership</a>
      </div>
    </div>
  )
}

// ─── NAV ──────────────────────────────────────────────
function Nav({ activeTab, setActiveTab, onJoin }) {
  const tabs = ['feed','marketplace','profile']
  return (
    <nav>
      <div className="nav-inner">
        <div className="wordmark-wrap">
          <a className="wordmark" href="#">TUSEN<em>B</em>RUK</a>
          <div className="wordmark-sub">A Thousand Uses</div>
        </div>
        <ul className="nav-links">
          {['Feed','Marketplace','Members'].map((label, i) => (
            <li key={label}>
              <a
                className={activeTab === tabs[i] ? 'active' : ''}
                onClick={() => { setActiveTab(tabs[i]); document.getElementById('app')?.scrollIntoView({behavior:'smooth'}) }}
              >{label}</a>
            </li>
          ))}
          <li><a href="#how">How It Works</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </div>
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────
function Hero({ onJoin, setActiveTab }) {
  return (
    <section className="hero">
      <div className="hero-l">
        <div>
          <div className="hero-eyebrow">A Private Community</div>
          <h1 className="hero-hl">
            Things worn<br />
            <span className="italic-line">beautifully</span>
            by living.
          </h1>
          <p className="hero-standfirst">A community for those who use, love, and trade the objects that carry their stories. Watches. Cars. Pens. Cameras. Boats.</p>
        </div>
        <div className="hero-ctas">
          <button className="btn-blk" onClick={onJoin}>Request an Invitation</button>
          <button className="btn-out" onClick={() => { setActiveTab('feed'); document.getElementById('app')?.scrollIntoView({behavior:'smooth'}) }}>Explore the Community</button>
        </div>
      </div>
      <div className="hero-r">
        {[['⌚','Watches','384'],['🚗','Cars','291'],['✒️','Pens','218'],['📷','Cameras','196']].map(([icon, name, count]) => (
          <div key={name} className="hero-cell" onClick={() => { setActiveTab('feed'); setTimeout(() => {}, 100) }}>
            <div className="c-icon">{icon}</div>
            <div className="c-name">{name}</div>
            <div className="c-count">{count} stories</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── TICKER ───────────────────────────────────────────
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((t, i) => <span key={i} className="t-item">{t}</span>)}
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────
function PostCard({ post, onOffer }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="post">
      <div className="post-hdr">
        <div className={`av ${post.avClass}`}>{post.avatar}</div>
        <div className="pm">
          <span className="p-author">{post.author}</span>
          {post.trusted && <span className="tp">Trusted</span>}
        </div>
        <span className="p-byline">{post.location} &nbsp;·&nbsp; {post.time}</span>
        <span className="p-cat">{post.cat.charAt(0).toUpperCase() + post.cat.slice(1)}</span>
      </div>
      <div className="p-img">{post.icon}</div>
      {post.forSale && (
        <div className="sale-strip">
          <span className="sl">◈ For Sale &nbsp;·&nbsp; Private offers</span>
          <span className="sp">{post.price}</span>
        </div>
      )}
      <div className="p-body">
        <h3 className="p-title">{post.title}</h3>
        <p className="p-caption">{post.caption}</p>
        <div className="char-note">
          <span className="cn-head">Character</span>
          <p>{post.character}</p>
        </div>
      </div>
      {post.forSale && (
        <div className="offer-row">
          <button className="btn-offer" onClick={onOffer}>Make a Private Offer</button>
        </div>
      )}
      <div className="p-footer">
        <button className="p-act" onClick={() => setLiked(!liked)}>
          {liked ? '♥' : '♡'} &nbsp;{post.likes + (liked ? 1 : 0)}
        </button>
        <button className="p-act">◌ &nbsp;{post.comments}</button>
        <button className="p-act">↗ Share</button>
        <span className="p-time">{post.time} ago</span>
      </div>
    </article>
  )
}

// ─── FEED ─────────────────────────────────────────────
function Feed({ onOffer, setActiveTab }) {
  const [activeCat, setActiveCat] = useState('all')
  const [activeFilter, setActiveFilter] = useState('Latest')

  const cats = [
    { key:'all', icon:'◎', label:'All Stories', count:'1.2k' },
    { key:'watches', icon:'⌚', label:'Watches', count:'384' },
    { key:'cars', icon:'🚗', label:'Cars', count:'291' },
    { key:'pens', icon:'✒️', label:'Pens', count:'218' },
    { key:'cameras', icon:'📷', label:'Cameras', count:'196' },
    { key:'boats', icon:'⛵', label:'Boats', count:'147' },
  ]

  const filtered = activeCat === 'all' ? POSTS : POSTS.filter(p => p.cat === activeCat)

  return (
    <div className="feed-grid">
      <aside className="sidebar">
        <div className="sb-sec">
          <div className="sb-head">Categories</div>
          <ul className="cat-list">
            {cats.map(c => (
              <li key={c.key} className={`cat-item ${activeCat === c.key ? 'active' : ''}`} onClick={() => setActiveCat(c.key)}>
                <span className="ci">{c.icon}</span>
                <span className="cn">{c.label}</span>
                <span className="cnum">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sb-sec">
          <div className="sb-head">Marketplace</div>
          <ul className="cat-list">
            <li className="cat-item" onClick={() => setActiveTab('marketplace')}><span className="ci">◈</span><span className="cn">For Sale</span><span className="cnum">64</span></li>
            <li className="cat-item"><span className="ci">◇</span><span className="cn">Wanted</span><span className="cnum">38</span></li>
          </ul>
        </div>
      </aside>

      <main className="feed-main">
        <div className="sec-bar">
          <span className="sec-label">Recent Stories</span>
          <div className="filter-row">
            {['Latest','Most Loved','Connections'].map(f => (
              <button key={f} className={`fbtn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.map(post => <PostCard key={post.id} post={post} onOffer={onOffer} />)}
      </main>

      <aside className="right-col">
        <div className="pb">
          <div className="sec-bar"><span className="sec-label">Trusted Members</span></div>
          {[
            { av:'av-a', l:'M', name:'Marcus Lindqvist', sub:'Watches · Stockholm', score:'4.97', vouches:'22 vouches' },
            { av:'av-c', l:'H', name:'Hamish Mackay', sub:'Pens · Edinburgh', score:'5.00', vouches:'41 vouches' },
            { av:'av-b', l:'E', name:'Eleanor Braun', sub:'Cars · Munich', score:'4.88', vouches:'16 vouches' },
          ].map(m => (
            <div key={m.name} className="mr" onClick={() => setActiveTab('profile')}>
              <div className={`av ${m.av}`} style={{width:28,height:28,fontSize:10}}>{m.l}</div>
              <div><div className="m-name">{m.name}</div><div className="m-sub">{m.sub}</div></div>
              <div className="r-badge"><span className="r-score">{m.score}</span><span className="r-lbl">{m.vouches}</span></div>
            </div>
          ))}
        </div>
        <div className="pb">
          <div className="sec-bar">
            <span className="sec-label">Market Highlights</span>
            <span className="sec-link" onClick={() => setActiveTab('marketplace')}>See All →</span>
          </div>
          {[
            { cat:'⌚ Watches', title:'IWC Portugieser 7-Day ref. 5001 — remarkable dial', price:'CHF 9,200' },
            { cat:'📷 Cameras', title:'Leica M3 DS, 1956 — single stroke, user-grade', price:'EUR 2,400' },
            { cat:'✒️ Pens', title:'Visconti Homo Sapiens — lava resin, lightly loved', price:'EUR 420' },
          ].map(m => (
            <div key={m.title} className="mkt-t" onClick={() => setActiveTab('marketplace')}>
              <div className="mt-cat">{m.cat}</div>
              <div className="mt-tl">{m.title}</div>
              <div className="mt-pr">{m.price}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

// ─── MARKETPLACE ──────────────────────────────────────
function Marketplace({ onOffer }) {
  const [activeCat, setActiveCat] = useState('All')
  const cats = ['All','Watches','Cars','Pens','Cameras','Boats','Wanted']

  const filtered = activeCat === 'All'
    ? LISTINGS
    : activeCat === 'Wanted'
    ? LISTINGS.filter(l => l.wanted)
    : LISTINGS.filter(l => l.cat === activeCat.toLowerCase())

  return (
    <div className="mkt-wrap">
      <div className="sec-bar">
        <span className="sec-label">Marketplace — Things with Stories, Seeking New Ones</span>
        <div className="filter-row">
          {cats.map(c => (
            <button key={c} className={`fbtn ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mkt-grid">
        {filtered.map(l => (
          <div key={l.id} className="lcard">
            <div className="l-img">{l.icon}</div>
            <div className="l-body">
              <div className="l-cat">{l.label}</div>
              <div className="l-title">{l.title}</div>
              <div className="l-char">{l.char}</div>
              <div className="l-footer">
                <div className="l-price">{l.price}</div>
                <div className="l-seller">
                  <div className={`av ${l.avClass}`} style={{width:18,height:18,fontSize:8}}>{l.avLetter}</div>
                  <div><div className="s-name">{l.seller}</div><div className="s-rep">★ {l.rep}</div></div>
                </div>
              </div>
              <button className="btn-osm" onClick={onOffer}>{l.wanted ? 'Contact Privately' : 'Make Private Offer'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PROFILE ──────────────────────────────────────────
function Profile({ onTestimonial }) {
  return (
    <>
      <div className="prof-band">
        <div className="prof-av">H</div>
        <div>
          <div className="prof-name">Hamish Mackay</div>
          <div className="prof-handle">@hamish.mackay &nbsp;·&nbsp; Edinburgh, Scotland</div>
          <div className="prof-bio">Mining financier, pen collector, reluctant car restorer. I believe things are made to be used, and that the best version of any object is the version shaped by one careful owner over many years.</div>
        </div>
        <div className="prof-stats">
          <div className="stats-row">
            {[['41','Vouches'],['5.00','Reputation'],['6','Years']].map(([v,l]) => (
              <div key={l} className="stat"><span className="sv">{v}</span><span className="sl2">{l}</span></div>
            ))}
          </div>
          <button className="btn-blk" onClick={onTestimonial}>Vouch for Hamish</button>
        </div>
      </div>
      <div className="prof-body">
        <div className="prof-main">
          <div className="sec-bar"><span className="sec-label">The Collection</span></div>
          <div className="coll-grid">
            {[
              ['✒️','Montblanc 149, 1994 — my father\'s nib'],
              ['✒️','Pelikan M1000, 2001 — broad nib'],
              ['⌚','Longines Heritage, 1959 — worn since 2003'],
              ['🚗','Land Rover Series III, 1977 — working truck'],
              ['📷','Leica M4, 1970 — silver chrome, user'],
              ['✒️','Visconti Homo Sapiens — daily writer'],
            ].map(([ico, nm]) => (
              <div key={nm} className="ci-item">
                <div className="ci-ico">{ico}</div>
                <div className="ci-nm">{nm}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="prof-side">
          <div className="sec-bar"><span className="sec-label">Testimonials</span></div>
          {[
            { txt: 'Hamish sold me a Pelikan M800 — described every flaw honestly and it was in better condition than he said. The definition of a Tusenbruk seller.', from: 'Marcus L. · Watches · Stockholm' },
            { txt: 'I bought Hamish\'s Parker 51 in 2021. It wrote beautifully from day one. His knowledge of vintage pens is encyclopaedic.', from: 'Sofia A. · Boats · Bergen' },
            { txt: 'A trustworthy and generous member. Has contributed more to the pens community than anyone I know.', from: 'Eleanor B. · Cars · Munich' },
          ].map(t => (
            <div key={t.from} className="tc">
              <div className="tc-txt">"{t.txt}"</div>
              <div className="tc-from">{t.from}</div>
            </div>
          ))}
          <button className="btn-blk" style={{width:'100%',marginTop:10}} onClick={onTestimonial}>Write a Testimonial</button>
        </div>
      </div>
    </>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n:'01', t:'Request an Invitation', d:'Tusenbruk is invite-only. Apply with your story — what you collect, how you use it, and why you believe things are made to be lived with.' },
    { n:'02', t:'Build your Reputation', d:'Your reputation is earned through connections, testimonials, and a history of honest dealings. It travels with you across all five categories.' },
    { n:'03', t:'Share your Stories', d:'Post about the things you love — their history, their character, the scratches and wear that make them yours. The feed rewards depth over frequency.' },
    { n:'04', t:'Trade with Confidence', d:'List items for sale, post wanted listings, and make or receive confidential offers. Every transaction is backed by the community\'s reputation system.' },
  ]
  return (
    <section className="how-sec" id="how">
      <div className="sec-bar"><span className="sec-label">How Tusenbruk Works</span></div>
      <div className="steps">
        {steps.map(s => (
          <div key={s.n} className="step">
            <div className="step-n">{s.n}</div>
            <div className="step-t">{s.t}</div>
            <p className="step-d">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ─────────────────────────────────────
function Testimonials() {
  const tbs = [
    { q: 'I\'ve bought and sold watches on every platform. Tusenbruk is the only one where I feel like I\'m dealing with people who actually care about the watch — not the price.', av:'av-a', l:'M', name:'Marcus Lindqvist', ctx:'Member 4 years · Stockholm' },
    { q: 'The Character Notes field changed how I think about selling. Being honest about wear and telling the story — I\'ve sold three pens for more than expected because of that honesty.', av:'av-c', l:'H', name:'Hamish Mackay', ctx:'Member 6 years · Edinburgh' },
    { q: 'I found a buyer for my father\'s car who understood what it was. Not a commodity. A family object. That wouldn\'t have happened anywhere else.', av:'av-b', l:'E', name:'Eleanor Braun', ctx:'Member 2 years · Munich' },
  ]
  return (
    <section className="test-sec" id="about">
      <div className="sec-bar"><span className="sec-label">Why Members Stay</span></div>
      <div className="test-grid">
        {tbs.map(t => (
          <div key={t.name} className="tb">
            <div className="tb-q">{t.q}</div>
            <div className="tb-author">
              <div className={`av ${t.av}`} style={{width:26,height:26,fontSize:10}}>{t.l}</div>
              <div><div className="tb-name">{t.name}</div><div className="tb-ctx">{t.ctx}</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────
function Footer({ onJoin }) {
  return (
    <footer>
      <div className="foot-top">
        <div>
          <div className="foot-brand">TUSEN<em>B</em>RUK</div>
          <div className="foot-tag">A private community for those who use what they love. Things worn beautifully by living.</div>
          <button className="btn-blk" onClick={onJoin}>Request Membership</button>
        </div>
        <div>
          <div className="foot-col-h">Community</div>
          <ul className="flinks">
            {['Feed','Marketplace','Members','Watches · Cars · Pens','Cameras · Boats'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="foot-col-h">About</div>
          <ul className="flinks">
            {['Our Philosophy','Membership','Trust & Reputation','Marketplace Guidelines','Contact'].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="foot-btm">
        <div className="fcopy">© 2026 Tusenbruk. A private community for those who use what they love.</div>
        <div className="fcopy">Privacy &nbsp;·&nbsp; Terms &nbsp;·&nbsp; Membership Agreement</div>
      </div>
    </footer>
  )
}

// ─── ROOT PAGE ────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState('feed')
  const [modal, setModal] = useState(null) // 'offer' | 'join' | 'testimonial' | 'signin'

  const openModal = (m) => setModal(m)
  const closeModal = () => setModal(null)

  return (
    <>
      <TopBar onJoin={() => openModal('join')} onSignIn={() => openModal('signin')} />
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} onJoin={() => openModal('join')} />
      <Hero onJoin={() => openModal('join')} setActiveTab={setActiveTab} />
      <Ticker />

      <div id="app">
        <div className="view-tabs">
          {[['feed','Feed'],['marketplace','Marketplace'],['profile','Member Profile']].map(([key,label]) => (
            <button key={key} className={`vtab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {activeTab === 'feed' && <Feed onOffer={() => openModal('offer')} setActiveTab={setActiveTab} />}
        {activeTab === 'marketplace' && <Marketplace onOffer={() => openModal('offer')} />}
        {activeTab === 'profile' && <Profile onTestimonial={() => openModal('testimonial')} />}
      </div>

      <HowItWorks />
      <Testimonials />
      <Footer onJoin={() => openModal('join')} />

      {/* ── MODALS ── */}
      {modal === 'offer' && (
        <Modal title="Make a Private Offer" sub="Your offer is confidential — only the seller will see it" onClose={closeModal}>
          <div className="m-field"><label className="m-lbl">Your Offer</label><input className="m-in" type="text" placeholder="e.g. EUR 35,000" /></div>
          <div className="m-field"><label className="m-lbl">Message to Seller (optional)</label><textarea className="m-in m-ta" placeholder="Introduce yourself, ask questions, or share why this piece interests you..." /></div>
          <div className="m-note"><strong>Private offers are confidential.</strong> The asking price and all other offers remain hidden. The seller may accept, decline, or counter privately.</div>
          <div className="m-acts"><button className="btn-cancel" onClick={closeModal}>Cancel</button><button className="btn-blk">Submit Offer</button></div>
        </Modal>
      )}

      {modal === 'join' && (
        <Modal title="Request Membership" sub="Membership is by application and invitation — tell us your story" onClose={closeModal}>
          <div className="m-field"><label className="m-lbl">Your Name</label><input className="m-in" type="text" placeholder="Full name" /></div>
          <div className="m-field"><label className="m-lbl">Email</label><input className="m-in" type="email" placeholder="your@email.com" /></div>
          <div className="m-field"><label className="m-lbl">Your Interests</label><input className="m-in" type="text" placeholder="e.g. Watches, Cars, Pens" /></div>
          <div className="m-field"><label className="m-lbl">Your Story</label><textarea className="m-in m-ta" placeholder="Tell us about the things you collect and use. What is your most loved object and why?" /></div>
          <div className="m-field"><label className="m-lbl">Member Referral (if any)</label><input className="m-in" type="text" placeholder="Tusenbruk username of the member who referred you" /></div>
          <div className="m-acts"><button className="btn-cancel" onClick={closeModal}>Cancel</button><button className="btn-blk">Submit Application</button></div>
        </Modal>
      )}

      {modal === 'testimonial' && (
        <Modal title="Write a Testimonial" sub="For Hamish Mackay · Published publicly on their profile" onClose={closeModal}>
          <div className="m-field"><label className="m-lbl">Context</label><input className="m-in" type="text" placeholder="e.g. Bought a Pelikan M800 · 2023" /></div>
          <div className="m-field"><label className="m-lbl">Your Testimonial</label><textarea className="m-in m-ta" placeholder="Describe your experience with this member — as a buyer, seller, or community contributor..." /></div>
          <div className="m-acts"><button className="btn-cancel" onClick={closeModal}>Cancel</button><button className="btn-blk">Publish Testimonial</button></div>
        </Modal>
      )}

      {modal === 'signin' && (
        <Modal title="Sign In" sub="Welcome back to Tusenbruk" onClose={closeModal}>
          <div className="m-field"><label className="m-lbl">Email</label><input className="m-in" type="email" placeholder="your@email.com" /></div>
          <div className="m-field"><label className="m-lbl">Password</label><input className="m-in" type="password" placeholder="••••••••" /></div>
          <div className="m-acts"><button className="btn-cancel" onClick={closeModal}>Cancel</button><button className="btn-blk">Sign In</button></div>
        </Modal>
      )}
    </>
  )
}
