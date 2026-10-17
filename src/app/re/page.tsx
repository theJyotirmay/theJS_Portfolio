"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const projects = [
  {
    number: "01",
    title: "Eleven Infra",
    domain: "eleveninfra.com",
    category: "Boutique architecture",
    image: "/re-web/eleven-rust.vercel.app.png",
    description:
      "Tactile architecture translated into a fast, expressive interface designed to make premium value immediately felt.",
    result: "Tactile digital commerce",
    url: "https://eleveninfra.com",
  },
  {
    number: "02",
    title: "Signature Infra",
    domain: "signatureinfra.in",
    category: "Mega developments",
    image: "/re-web/signatureinfra.in.png",
    description:
      "A confident flagship experience that gives complex portfolios the clarity, speed, and polish investors expect.",
    result: "Investor-grade portfolio",
    url: "https://signatureinfra.in",
  },
  {
    number: "03",
    title: "Shyaswa",
    domain: "shyaswa.com",
    category: "Contemporary living",
    image: "/re-web/shyaswa.com.png",
    description:
      "A warm, frictionless property discovery flow where neighborhood, lifestyle, and a tour are always one tap away.",
    result: "Consumer-first discovery",
    url: "https://shyaswa.com",
  },
  {
    number: "04",
    title: "Royal Builder",
    domain: "royalbuilder.co.in",
    category: "Luxury residential",
    image: "/re-web/royalbuilder.co.in.png",
    description:
      "A high-intent digital home for ambitious spaces, built to make every floorplan feel tangible before the first conversation.",
    result: "High-intent lead routing",
    url: "https://royalbuilder.co.in",
  },
];

function LineArt() {
  return (
    <svg className={styles.lineArt} viewBox="0 0 500 500" aria-hidden="true">
      <circle cx="250" cy="250" r="165" />
      <circle cx="250" cy="250" r="112" />
      <path d="M250 25v450M25 250h450" />
      <path d="m83 83 334 334M417 83 83 417" />
      <path d="M250 85 415 250 250 415 85 250Z" />
    </svg>
  );
}

function ProjectCard({
  project,
  index,
  active,
}: {
  project: (typeof projects)[number];
  index: number;
  active: boolean;
}) {
  return (
    <article id={`project-${index + 1}`} className={`${styles.project} ${active ? styles.projectActive : ""}`}>
      <div className={styles.projectMeta}>
        <div className={styles.projectIndex}>
          <span>{project.number}</span>
          <span className={styles.metaRule} />
          <span>{project.category}</span>
        </div>
        <a href={project.url} target="_blank" rel="noreferrer" className={styles.visitLink}>
          Visit live site <span>↗</span>
        </a>
      </div>

      <a href={project.url} target="_blank" rel="noreferrer" className={styles.browserFrame} aria-label={`Visit ${project.title}`}>
        <div className={styles.browserBar}>
          <div className={styles.browserDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>https://{project.domain}</span>
          <span className={styles.browserArrow}>↗</span>
        </div>
        <div className={styles.imageWrap}>
          <div className={styles.imageInset}>
            <img src={project.image} alt={`${project.title} website preview`} />
          </div>
          <span className={styles.imageLabel}>Selected work / {project.number}</span>
        </div>
      </a>

      <div className={styles.projectCopy}>
        <div>
          <p className={styles.kicker}>Digital experience</p>
          <h3>{project.title}</h3>
        </div>
        <div>
          <p>{project.description}</p>
          <span className={styles.result}>{project.result}</span>
        </div>
      </div>
    </article>
  );
}

export default function RePage() {
  const [activeProject, setActiveProject] = useState(0);

  useEffect(() => {
    const sections = projects
      .map((_, index) => document.getElementById(`project-${index + 1}`))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const index = sections.indexOf(visible.target as HTMLElement);
          if (index !== -1) setActiveProject(index);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />
      <header className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="Return to main portfolio">
          <img className={styles.brandLogo} src="/the_js_logo_white.png" alt="The JS" />
        </Link>
      </header>

      <section className={styles.hero}>
        <video className={styles.heroVideo} src="/re-web/hero.mp4" autoPlay muted loop playsInline aria-hidden="true" />
        <div className={styles.heroWash} />
        <LineArt />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}><span>04</span> Selected digital worlds</p>
          <h1>Websites that<br /><em>make space</em> memorable.</h1>
          <p className={styles.heroIntro}>
            Intentional digital experiences for places people dream about. Designed with restraint, built for movement.
          </p>
        </div>
      </section>

      <section className={styles.statement}>
        <div className={styles.sectionNumber}>01 / 03</div>
        <div className={styles.statementBody}>
          <p className={styles.eyebrow}>A better first impression</p>
          <h2>Less noise.<br /><em>More feeling.</em></h2>
          <p className={styles.statementText}>
            The best real estate experiences do more than list features. They create a sense of arrival. Every interaction here is considered to turn attention into confidence, and confidence into action.
          </p>
        </div>
        <div className={styles.statementOrbit}><LineArt /><span>Human Built</span></div>
      </section>

      <section id="work" className={styles.work}>
        <div className={styles.projectLayout}>
          <aside className={styles.workSidebar}>
            <div className={styles.workHeader}>
              <p className={styles.eyebrow}>The work</p>
              <h2>Built for<br /><em>belonging.</em></h2>
              <p className={styles.workDescription}>Digital homes for the builders, architects, and places shaping what comes next.</p>
            </div>
            <nav className={styles.projectRail} aria-label="Project navigation">
              {projects.map((project, index) => (
                <a key={project.number} href={`#project-${index + 1}`} className={activeProject === index ? styles.railActive : ""}>
                  <span>{project.number}</span><i />
                  <b>{project.title}</b>
                </a>
              ))}
            </nav>
          </aside>
          <div className={styles.projectList}>
            {projects.map((project, index) => (
              <ProjectCard key={project.number} project={project} index={index} active={activeProject === index} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.manifesto}>
        <div className={styles.manifestoOrb} aria-hidden="true"><LineArt /></div>
        <div className={styles.manifestoContent}>
          <p className={styles.eyebrow}>A point of view</p>
          <blockquote>“Make it feel inevitable.”</blockquote>
          <p>Because when the interface disappears, the story gets room to stay.</p>
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <div className={styles.contactTop}><span>03 / 03</span><span>Let&apos;s make something felt</span></div>
        <div className={styles.contactBody}>
          <p className={styles.eyebrow}>Have a place in mind?</p>
          <h2>Let&apos;s build<br /><em>its next chapter.</em></h2>
          <a href="/#Contact" className={styles.contactButton}>Start a conversation <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
