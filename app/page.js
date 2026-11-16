"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { products, categories, promos, navItems } from "../data/store";
import styles from "./page.module.css";

function Toast({ message, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!message) return;
    let cancelled = false;
    let ctx;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(ref.current, { y: 18, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "back.out(1.5)" });
        gsap.to(ref.current, { opacity: 0, y: 10, delay: 2.6, duration: 0.25, onComplete: onDone });
      });
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, [message, onDone]);
  return message ? <div ref={ref} className={styles.toast} role="status">{message}</div> : null;
}

export default function Home() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ identity: "", password: "" });
  const [formError, setFormError] = useState("");
  const [progress, setProgress] = useState(false);
  const [dark, setDark] = useState(false);
  const [bagBounce, setBagBounce] = useState(false);
  const modal = useRef(null);
  const reveal = useRef(null);
  const showToast = useCallback((message) => setToast(message), []);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("potluck-cart") || "{}")); setDark(localStorage.getItem("potluck-theme") === "dark"); } catch { /* ignore corrupt browser storage */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("potluck-cart", JSON.stringify(cart)); } catch { /* storage may be unavailable */ } }, [cart]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = dark ? "dark" : "light";
    try { localStorage.setItem("potluck-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  useEffect(() => {
    let cancelled = false;
    let ctx;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return;
        gsap.from(".entrance", { y: 16, opacity: 0, duration: .65, stagger: .07, ease: "power2.out" });
        gsap.from(".deal-card", { y: 26, opacity: 0, duration: .55, stagger: .1, delay: .25, ease: "power2.out" });
        gsap.from(".promo-card", { y: 22, opacity: 0, duration: .5, stagger: .09, delay: .35 });
        gsap.fromTo(".reward-fill", { width: "0%" }, { width: "62%", duration: 1.2, delay: .6, ease: "power2.out" });
        gsap.utils.toArray(".reveal").forEach((el) => gsap.from(el, { y: 24, opacity: 0, duration: .6, scrollTrigger: { trigger: el, start: "top 88%" } }));
      }, reveal);
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, []);
  useEffect(() => {
    if (!loginOpen) return;
    let cancelled = false;
    let ctx;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !modal.current) return;
      ctx = gsap.context(() => gsap.fromTo(modal.current, { opacity: 0, y: 20, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .28, ease: "power2.out" }));
    });
    const key = (e) => e.key === "Escape" && closeLogin();
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => { cancelled = true; ctx?.revert(); window.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [loginOpen]);

  const lines = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty })), [cart]);
  const count = lines.reduce((n, p) => n + p.qty, 0);
  const subtotal = lines.reduce((n, p) => n + p.price * p.qty, 0);
  const results = query.trim() ? products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())) : [];
  const add = (id) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setBagBounce(true); window.setTimeout(() => setBagBounce(false), 450);
    showToast("Added to your bag ✨");
  };
  const remove = (id) => { setCart((c) => { const next = { ...c }; delete next[id]; return next; }); showToast("Product removed from your bag"); };
  const closeLogin = () => {
    if (modal.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      import("gsap").then(({ default: gsap }) => {
        if (modal.current) gsap.to(modal.current, { opacity: 0, y: 12, scale: .98, duration: .16, onComplete: () => setLoginOpen(false) });
        else setLoginOpen(false);
      });
    } else setLoginOpen(false);
  };
  const guest = () => { closeLogin(); showToast("You’re browsing as a guest 👋"); };
  const submitLogin = (e) => {
    e.preventDefault();
    if (!form.identity.trim() || !form.password.trim()) { setFormError("Enter your email or mobile number and password."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.identity) && !/^[+\d][\d\s-]{7,}$/.test(form.identity)) { setFormError("Enter a valid email address or mobile number."); return; }
    setFormError("");
    closeLogin();
    showToast("Demo sign-in complete — no account was created.");
  };

  return <div className={styles.site} ref={reveal}>
    <div className={styles.announcement}><div className={styles.ticker}>✦ GOOD FOOD, GOOD MOOD &nbsp; · &nbsp; FREE DELIVERY ON ORDERS ABOVE ₹499 &nbsp; · &nbsp; GOOD FOOD, GOOD MOOD &nbsp; · &nbsp; FREE DELIVERY ON ORDERS ABOVE ₹499 &nbsp; · &nbsp;</div></div>
    <header className={`${styles.header} entrance`}>
      <a href="#top" className={styles.brand} aria-label="Potluck Bazaar home"><span className={styles.brandMark}>p<span>!</span></span><span>potluck<span className={styles.brandSecond}>bazaar</span></span></a>
      <button className={styles.location} onClick={() => showToast("Delivery location: Bengaluru, India")}>📍 <span><small>Delivering to</small><b>Bengaluru</b></span><span className={styles.chevron}>⌄</span></button>
      <div className={styles.searchWrap}><form className={styles.search} onSubmit={(e) => { e.preventDefault(); document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" }); }}><span>⌕</span><input aria-label="Search products" placeholder="Search for snacks, treats & more..." value={query} onChange={(e) => setQuery(e.target.value)} /><button aria-label="Search">→</button></form>{results.length > 0 && <div className={styles.searchResults}>{results.map((p) => <button key={p.id} onClick={() => { setQuery(""); document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" }); }}>{p.emoji} {p.name}</button>)}</div>}</div>
      <button className={styles.account} onClick={() => setLoginOpen(true)}><span className={styles.accountIcon}>♙</span><span><small>Hello, foodie</small><b>Sign in / Register</b></span></button>
      <button className={`${styles.bag} ${bagBounce ? styles.bounce : ""}`} onClick={() => setCartOpen(true)} aria-label={`Open shopping bag, ${count} items`}>♧<span>Bag</span><i>{count}</i></button>
      <button className={styles.themeToggle} onClick={() => setDark((v) => !v)} aria-label="Toggle dark mode">{dark ? "☀" : "☾"}</button>
    </header>
    <nav className={`${styles.nav} entrance`} aria-label="Shop categories">{navItems.map((n) => <a href={n.href} key={n.label}>{n.label}</a>)}</nav>

    <main id="top" className={styles.container}>
      <div className={styles.heroRow}>
        <section className={`${styles.reward} entrance`}><div className={styles.rewardCopy}><span className={styles.eyebrow}>A LITTLE SOMETHING FOR YOU</span><h1>Good things<br />come to <em>foodies.</em></h1><p>Get <b>₹300 in rewards</b> when you join the Potluck party.</p><button className={styles.darkButton} onClick={() => { setProgress(true); showToast("Your reward journey has started! 🎉"); }}>Play now <span>↗</span></button></div><div className={styles.rewardArt}><span className={styles.artStar}>✳</span><span className={styles.snackEmoji}>🍊</span><span className={styles.artDot}>✦</span><div className={styles.rewardTicket}><small>YOUR REWARD</small><b>₹300</b><span>in foodie points</span></div></div><div className={styles.progress}><span><b>YOUR POTLUCK JOURNEY</b><small>{progress ? "Just getting started!" : "You're on your way"}</small></span><div className={styles.progressTrack}><i className="reward-fill" style={{ width: progress ? "78%" : undefined }} /></div><span className={styles.progressCount}>{progress ? "3" : "2"}<small>/ 5</small></span></div></section>
        <aside className={`${styles.offer} entrance`}><div className={styles.offerTop}><span>THE POTLUCK PERK</span><span className={styles.spark}>✳</span></div><h2>Extra <strong>15%</strong><br />back in your<br /><em>pocket.</em></h2><p>Because the best things in life are shared (and saved).</p><ul><li><span>✓</span> Exclusive member-only deals</li><li><span>✓</span> Early access to new drops</li><li><span>✓</span> Free delivery on your first order</li></ul><button onClick={() => setLoginOpen(true)} className={styles.whiteButton}>Sign me up <span>↗</span></button><small className={styles.newCustomer}>New around here? <button onClick={() => setLoginOpen(true)}>Create an account</button></small></aside>
      </div>

      <section className={styles.section} id="deals"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>THE CROWD PLEASERS</span><h2>Popular <em>deals</em></h2></div><a className={styles.textLink} href="#moods">See all deals <span>↗</span></a></div><div className={styles.deals}>{products.map((p) => <article key={p.id} className={`${styles.dealCard} deal-card`}><div className={styles.productArt} style={{ background: p.color }}><span className={styles.discount}>{p.discount}% OFF</span><span className={styles.productEmoji}>{p.emoji}</span><span className={styles.artBadge}>{p.badge}</span></div><div className={styles.productInfo}><div><h3>{p.name}</h3><p>{p.description}</p></div><div className={styles.productBottom}><span><b>₹{p.price}</b> <del>₹{p.mrp}</del></span><button onClick={() => add(p.id)}>+ Add</button></div></div></article>)}</div></section>

      <section className={styles.section} id="picks"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>A LITTLE BIT OF EVERYTHING</span><h2>Good stuff, <em>all around.</em></h2></div></div><div className={styles.promos}>{promos.map((p) => <a key={p.title} href="#moods" className={`${styles.promo} promo-card`} style={{ background: p.color }}><span className={styles.promoEmoji}>{p.emoji}</span><div><small>{p.kicker}</small><h3>{p.title}</h3><span className={styles.promoLink}>Shop now ↗</span></div></a>)}</div></section>

      <section className={`${styles.section} reveal`} id="moods"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>WHAT ARE YOU IN THE MOOD FOR?</span><h2>Shop by <em>mood.</em></h2></div><a className={styles.textLink} href="#footer">Explore everything <span>↗</span></a></div><div className={styles.categories}>{categories.map((c) => <article key={c.name} className={styles.category} style={{ "--category": c.color }}><div className={styles.categoryHead}><span>{c.emoji}</span><h3>{c.name}</h3><b>↗</b></div><div className={styles.subcats}>{c.items.map((item, i) => <a href="#deals" key={item}>{c.itemEmojis[i]} {item}</a>)}</div></article>)}</div></section>
    </main>
    <footer className={styles.footer} id="footer"><div className={styles.footerInner}><div className={styles.footerBrand}><a href="#top" className={styles.brand}><span className={styles.brandMark}>p<span>!</span></span><span>potluck<span className={styles.brandSecond}>bazaar</span></span></a><p>Good food tastes better<br />when it’s shared. 💛</p></div><div><h4>THE GOOD STUFF</h4><a href="#deals">Shop all</a><a href="#moods">Shop by mood</a><a href="#picks">Our offers</a></div><div><h4>HERE TO HELP</h4><a href="#footer">Contact us</a><a href="#footer">FAQs</a><a href="#footer">Delivery info</a></div><div><h4>COME HANG OUT</h4><p>Follow along for all<br />the good stuff.</p><div className={styles.socials}><a href="#footer" aria-label="Instagram">ig</a><a href="#footer" aria-label="Facebook">f</a><a href="#footer" aria-label="Pinterest">p</a></div></div></div><div className={styles.footerBottom}><span>© 2025 Potluck Bazaar. Made for sharing.</span><span>Privacy · Terms · Made with ♥ and a little bit of masala</span></div></footer>

    {cartOpen && <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && setCartOpen(false)}><aside className={`${styles.drawer} ${styles.cartDrawer}`} aria-label="Shopping bag"><div className={styles.drawerHead}><div><span className={styles.eyebrow}>YOUR GOODIES</span><h2>Your bag <em>({count})</em></h2></div><button className={styles.close} onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>{!lines.length ? <div className={styles.emptyBag}><span>🛍️</span><h3>Your bag is waiting for a little joy.</h3><button className={styles.darkButton} onClick={() => setCartOpen(false)}>Find some treats ↗</button></div> : <><div className={styles.cartLines}>{lines.map((p) => <div className={styles.cartLine} key={p.id}><span className={styles.cartEmoji} style={{ background: p.color }}>{p.emoji}</span><div className={styles.cartProduct}><b>{p.name}</b><small>₹{p.price} each · Qty {p.qty}</small></div><strong>₹{p.price * p.qty}</strong><button aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)}>×</button></div>)}</div><div className={styles.cartTotal}><span>Subtotal</span><b>₹{subtotal}</b></div><button className={styles.darkButton + " " + styles.checkout} onClick={() => showToast("Checkout demo — your treats are saved in your bag!")}>Continue to checkout <span>↗</span></button></>}</aside></div>}

    {loginOpen && <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && closeLogin()}><section className={styles.loginModal} ref={modal} role="dialog" aria-modal="true" aria-labelledby="login-title"><button className={styles.close} onClick={closeLogin} aria-label="Close sign in">×</button><span className={styles.loginEmoji}>🍊</span><span className={styles.eyebrow}>COME ON IN</span><h2 id="login-title">Good to see <em>you.</em></h2><p>Sign in for extra treats, member perks and more.</p><form onSubmit={submitLogin} noValidate><label>Email or mobile number<input autoFocus autoComplete="username" value={form.identity} onChange={(e) => { setForm({ ...form, identity: e.target.value }); setFormError(""); }} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setFormError(""); }} placeholder="Your password" /></label>{formError && <p className={styles.formError} role="alert">{formError}</p>}<button className={styles.darkButton} type="submit">Sign in <span>↗</span></button></form><div className={styles.loginDivider}><span>or</span></div><button className={styles.guestButton} onClick={guest}>Continue as guest</button><small className={styles.demoNote}>Demo sign-in · no account details are sent or stored.</small></section></div>}
    <Toast message={toast} onDone={() => setToast("")} />
  </div>;
}
