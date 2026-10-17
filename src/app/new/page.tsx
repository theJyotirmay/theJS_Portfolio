"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const displayVideos = [
  "From Klickpin.com- Dreamy side hustle ideas that make your next project look polished and expensive with simple details that elevate the final loo.mp4",
  "From Klickpin.com- 35 Luxury romantic date night ideas that look expensive while staying practical realistic and beginner friendly for busy people.mp4",
  "From Klickpin.com- 35 Luxury romantic date night ideas that look expensive while staying practical realistic and beginner friendly for busy people (1).mp4",
  "From Klickpin.com- Get inspired by Fresh meal prep recipes that make your next project look polished and expensive for ideas worth saving right no.mp4",
  "From Klickpin.com- Dreamy wedding hair ideas that are trending right now and still timeless enough to save for later for creators who love polishe.mp4",
  "From Klickpin.com- Practical clean car habits and clever inspiration for busy days for calm daily routines-pin-id-946881890438431954.mp4",
  "From Klickpin.com- Morning trusting God thoughts with simple charm and useful ideas this season with grace and hope-pin-id-1109504058220893158.mp4",
  "From Klickpin.com- Style these elegant gallery wall ideas that look high-end but stay practical with aesthetic touches that photograph beautifully.mp4",
  "From Klickpin.com- Practical clean car habits and clever inspiration for busy days for calm daily routines-pin-id-569353577917214566.mp4",
  "From Klickpin.com- Try Beautiful morning routine ideas that are trending right now across Pinterest boards for ideas worth saving right now-pin-id.mp4",
];

function LineArt() {
  return (
    <svg className={styles.lineArt} viewBox="0 0 500 500" aria-hidden="true">
      <circle cx="250" cy="250" r="190" />
      <circle cx="250" cy="250" r="145" />
      <path d="M250 20v460M20 250h460M88 88l324 324M412 88 88 412" />
      <path d="m250 55 195 195-195 195L55 250Z" />
      <circle cx="250" cy="250" r="32" />
    </svg>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`${styles.reveal} ${visible ? styles.revealed : ""} ${className}`}>{children}</div>;
}

function HoverVideo({ src, index }: { src: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playFromStart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const playRequest = video.play();
    playRequest?.catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Unable to play hover video.", error);
    });
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`Website mood study ${index + 1}`}
      onMouseEnter={playFromStart}
      onMouseLeave={stopVideo}
      onFocus={playFromStart}
      onBlur={stopVideo}
    />
  );
}

export default function NewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.nav}>
        <Link href="/" className={styles.logo} aria-label="Return to main portfolio">
          <img src="/the_js_logo_white.png" alt="The JS" />
        </Link>
      </header>

      <section className={styles.hero}>
        <video className={styles.heroVideo} src="/new/hero.mp4" autoPlay muted loop playsInline aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroGrid} aria-hidden="true" />
        <LineArt />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}><span>01</span> Strategy before pixels</p>
          <h1>Strategize<br />your <em>next move.</em></h1>
          <p className={styles.heroIntro}>Your website is not a brochure. It is the first move in every relationship that follows.</p>
          <a href="#work" className={styles.workCta}>See the work <span>↘</span></a>
        </div>
      </section>

      <section className={styles.manifesto}>
        <div className={styles.sectionMark}>02 / 05</div>
        <div className={styles.manifestoFlow}>
          <Reveal className={styles.manifestoCopy}>
            <p className={styles.eyebrow}>The uncomfortable truth</p>
            <h2>Most developers these days are using AI</h2>
            <p className={styles.humanTouchLine}>When asked to add human touch they say</p>
          </Reveal>
          <div className={styles.funFrame}>
            <img src="/new/fun.jpg" alt="A playful visual about adding human touch to an AI-built website" />
          </div>
          <Reveal className={styles.manifestoAfter}>
            <p>Because a prompt, a template, and a handful of safe decisions can only take a project so far.</p>
          </Reveal>
        </div>
      </section>

      <section id="work" className={styles.work}>
        <div className={styles.workHeader}>
          <Reveal>
            <p className={styles.eyebrow}>A little proof</p>
            <h2>If you want your site<br />to look like <em>these websites.</em></h2>
          </Reveal>
          <p className={styles.workNote}>Not more noise. Not another template. Just digital worlds with a point of view — and enough friction removed to make the right person say yes.</p>
        </div>
        <div className={styles.gallery}>
          {displayVideos.map((video, index) => (
            <Reveal key={video} className={`${styles.galleryItem} ${index % 5 === 1 ? styles.galleryTall : ""} ${index % 5 === 3 ? styles.galleryOffset : ""}`}>
              <div className={styles.videoCard}>
              <HoverVideo src={`/new/Display/${encodeURIComponent(video)}`} index={index} />
                <div className={styles.cardOverlay}><span>0{index + 1}</span><span>View / feel / remember</span></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.bridge}>
        <LineArt />
        <Reveal>
          <p className={styles.eyebrow}>The advantage</p>
          <blockquote>“People don&apos;t hire the best website.<br /><em>They hire the clearest feeling.</em>”</blockquote>
          <p>Let&apos;s make yours impossible to confuse with everyone else.</p>
        </Reveal>
      </section>

      <footer id="contact" className={styles.footer}>
        <div className={styles.footerImage} />
        <div className={styles.footerShade} />
        <div className={styles.footerContent}>
          <div className={styles.footerTop}><span>05 / 05</span></div>
          <div className={styles.footerMain}>
            <p className={styles.eyebrow}>Your next move starts here</p>
            <h2>Make them<br /><em>remember you.</em></h2>
            <Link className={styles.contactButton} href="/#Contact">Let&apos;s build your unfair advantage <span>↗</span></Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
