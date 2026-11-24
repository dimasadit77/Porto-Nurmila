"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { profile, experience, organisasi, events, education, certifications, skills, gallery, contacts } from "../data/profile";

const tabs = [
  ["tentang", "Tentang"],
  ["pengalaman", "Pengalaman"],
  ["organisasi", "Organisasi"],
  ["kepanitiaan", "Kepanitiaan"],
  ["pendidikan", "Pendidikan"],
  ["sertifikasi", "Sertifikasi"],
  ["keahlian", "Keahlian"],
  ["kontak", "Kontak"],
];

const initials = profile.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
const LIMIT = 4;  // jumlah card yang langsung tampil
const PEEK = 90;  // tinggi card ke-7 yang "ngintip" (px)

const icons = {
  instagram: (<><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>),
  tiktok: (<><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.3 2.4 2.1 4.2 5 4.5" /></>),
  mail: (<><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M22 6l-10 7L2 6" /></>),
  linkedin: (<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>),
  youtube: (<><path d="M22.5 6.4a2.8 2.8 0 0 0-1.9-2C18.9 4 12 4 12 4s-6.9 0-8.6.5a2.8 2.8 0 0 0-1.9 2A29 29 0 0 0 1 11.8a29 29 0 0 0 .5 5.3 2.8 2.8 0 0 0 1.9 2c1.7.5 8.6.5 8.6.5s6.900 0 8.600-.5a2.8 2.8 0 0 0 1.900-2 29 29 0 0 0 .5-5.300 29 29 0 0 0-.5-5.400z" /><path d="M9.750 15 15.500 11.800 9.750 8.500z" /></>),
};

function Photos({ photos, onOpen }) {
  if (!photos?.length) return null;
  const shown = photos.slice(0, 3);
  const rest = photos.length - shown.length;
  return (
    <div className="thumbs">
      {shown.map((ph, i) => {
        const last = i === shown.length - 1 && rest > 0;
        return (
          <button
            key={ph.src}
            type="button"
            className="thumb"
            onClick={() => onOpen(photos, i)}
            aria-label={last ? `Lihat semua ${photos.length} foto` : `Lihat foto: ${ph.alt}`}
          >
            <img src={ph.src} alt={ph.alt} loading="lazy" />
            {last && <span className="more-count">+{rest}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Timeline({ items, onOpen }) {
  return (
    <ol className="timeline">
      {items.map((e) => (
        <li key={e.role + e.org}>
          <h3>{e.role}</h3>
          <p className="meta">{e.org}, {e.period}</p>
          <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <Photos photos={e.photos} onOpen={onOpen} />
        </li>
      ))}
    </ol>
  );
}

function Lightbox({ photos, start, onClose }) {
  const [i, setI] = useState(start);
  const closeRef = useRef(null);
  const prev = () => setI((n) => (n - 1 + photos.length) % photos.length);
  const next = () => setI((n) => (n + 1) % photos.length);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, []);

  const p = photos[i];
  const icon = (d) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="Galeri foto" onClick={onClose}>
      <button ref={closeRef} className="lb-close" onClick={onClose} aria-label="Tutup">{icon("M6 6l12 12M18 6L6 18")}</button>
      {photos.length > 1 && (
        <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Foto sebelumnya">{icon("M15 6l-6 6 6 6")}</button>
      )}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={p.src} alt={p.alt} />
        <figcaption>{p.alt} ({i + 1} dari {photos.length})</figcaption>
      </figure>
      {photos.length > 1 && (
        <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Foto berikutnya">{icon("M9 6l6 6-6 6")}</button>
      )}
    </div>
  );
}

function ContactIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState("tentang");
  const barRef = useRef(null);

  const [lightbox, setLightbox] = useState(null);
  const openPhotos = (photos, index) => setLightbox({ photos, index });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [showAll, setShowAll] = useState(false);
  const [clipH, setClipH] = useState(null);
  const cardsRef = useRef(null);

  const hasMore = events.length > LIMIT;
  const collapsed = hasMore && !showAll && clipH !== null;

  // Tutup dropdown kalau klik di luar atau tekan Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Scroll spy: tandai tab sesuai section yang sedang terlihat
  useEffect(() => {
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) return setActive(tabs[tabs.length - 1][0]);
      const line = 120; // jarak dari atas layar
      let current = tabs[0][0];
      for (const [id] of tabs) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Di layar kecil, geser tab bar supaya tab aktif selalu kelihatan
  useEffect(() => {
    const bar = barRef.current;
    const el = bar?.querySelector(`[data-id="${active}"]`);
    if (bar && el) bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = cardsRef.current?.children[LIMIT];
      setClipH(el ? el.offsetTop + PEEK : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  };

  const toggleEvents = () => {
    if (showAll) document.getElementById("kepanitiaan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowAll((v) => !v);
  };
  
  return (
    <div className="page">
      <header>
        {/* Ganti dengan foto: taruh file di public/cover.jpg lalu ubah background .cover di globals.css */}
        <div className="cover" role="img" aria-label="Banner halaman" />
        <div className="head">
          {/* Ganti dengan foto: <img className="avatar" src="/foto.jpg" alt={profile.name} /> */}
          <div className="avatar" aria-hidden="true">{initials}</div>
          <div className="who">
            <h1>{profile.name}</h1>
            <p className="role">{profile.title}</p>
          </div>
          <div className="actions">
            <div className="more" ref={menuRef}>
              <button
                className="btn primary"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                Menu
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 6, verticalAlign: "-3px" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div className="menu" role="menu">
                  <a role="menuitem" href={`mailto:${profile.email}`} onClick={() => setMenuOpen(false)}>Kirim pesan</a>
                  <a role="menuitem" href="/cv.pdf" download onClick={() => setMenuOpen(false)}>Unduh CV</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="barwrap">
        <nav className="tabbar" ref={barRef} aria-label="Navigasi halaman">
          {tabs.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              data-id={id}
              className={active === id ? "tab on" : "tab"}
              aria-current={active === id ? "true" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <button className="theme" onClick={toggleTheme} aria-label="Ganti tema terang atau gelap" title="Ganti tema">
          <svg className="i-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          <svg className="i-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        </button>
      </div>

      <main>
        <section id="tentang">
          <h2>Tentang Saya</h2>

          <div className="gallery">
            {gallery.map((g) => (
              <figure key={g.src}>
                <img src={g.src} alt={g.alt} loading="lazy" />
              </figure>
            ))}
          </div>

          <p className="lead">{profile.tagline}</p>
          {profile.about.map((p) => <p key={p}>{p}</p>)}
        </section>

        <section id="pendidikan">
          <h2>Pendidikan</h2>
          <ul className="rows">
            {education.map((e) => (
              <li key={e.title} className="row">
                <div className="row-head">
                  <div>
                    <h3>{e.title}</h3>
                    <p className="meta">{e.org}</p>
                  </div>
                  <span className="card-year">{e.period}</span>
                </div>

                {e.courses?.length > 0 && (
                  <div className="row-courses">
                    <ul className="mini-cards">
                      {e.courses.map((c) => (
                        <li key={c.name} className="mini-card">
                          <strong>{c.name}</strong>
                          {c.note && <span>{c.note}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section id="pengalaman">
          <h2>Pengalaman profesional</h2>
          <Timeline items={experience} onOpen={openPhotos} />
        </section>

        <section id="organisasi">
          <h2>Organization Experience</h2>
          <Timeline items={organisasi} onOpen={openPhotos} />
        </section>

        <section id="kepanitiaan">
          <h2>Volunteers</h2>
          <div className="cards-wrap">
            <ul
              id="daftar-kepanitiaan"
              ref={cardsRef}
              className={collapsed ? "cards clipped" : "cards"}
              style={collapsed ? { maxHeight: clipH } : undefined}
            >
              {events.map((e, i) => (
                <li key={e.title} className="card" inert={collapsed && i >= LIMIT}>
                  <span className="card-year">{e.year}</span>
                  <h3>{e.title}</h3>
                  <p className="meta">{e.role}</p>
                  <p>{e.desc}</p>
                </li>
              ))}
            </ul>

            {collapsed && <div className="cards-fade" aria-hidden="true" />}

            {hasMore && (
              <div className={collapsed ? "cards-more" : "cards-more open"}>
                <button
                  type="button"
                  className="btn"
                  aria-expanded={showAll}
                  aria-controls="daftar-kepanitiaan"
                  onClick={toggleEvents}
                >
                  {showAll ? "Lihat lebih sedikit" : "Lihat selengkapnya"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="sertifikasi">
          <h2>Sertifikasi</h2>
          <ul className="cards">
            {certifications.map((c, i) => (
              <li key={`${c.title}-${i}`} className="card cert">
                {c.photos?.length > 0 && (
                  <button
                    type="button"
                    className="cert-photo"
                    onClick={() => openPhotos(c.photos, 0)}
                    aria-label={`Lihat sertifikat: ${c.title}`}
                  >
                    <img src={c.photos[0].src} alt={c.photos[0].alt} loading="lazy" />
                    {c.photos.length > 1 && <span className="cert-count">+{c.photos.length - 1}</span>}
                  </button>
                )}
                <div className="cert-body">
                  <span className="card-year">{c.period}</span>
                  <h3>{c.title}</h3>
                  <p className="meta">{c.org}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="keahlian">
          <h2>Keahlian</h2>
          {skills.map((s) => (
            <div key={s.group} className="skillgroup">
              <h3>{s.group}</h3>
              <ul className="tags">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </section>

        <section id="kontak">
          <h2>Kontak</h2>
          <p>Terbuka untuk magang, kolaborasi program, atau diskusi seputar manajemen pendidikan dan pengembangan SDM.</p>
          <ul className="contacts">
            {contacts.map((c) => (
              <li key={c.label}>
                <a
                  className="contact"
                  href={c.href}
                  {...(c.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <ContactIcon name={c.icon} />
                  <span className="contact-label">{c.label}</span>
                  <span className="contact-handle">{c.handle}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="meta">{profile.location}</p>
        </section>
      </main>

      {lightbox && (
        <Lightbox photos={lightbox.photos} start={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}