"use client";
import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

function LocalTime() {
  const [time, setTime] = React.useState("Loading...");
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{time}</>;
}

function stackServiceCards() {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>("[data-service-card]")
  );
  if (!cards.length) return;

  const base = window.innerHeight * 0.2;
  let offset = base;
  const tops: number[] = [];

  cards.forEach((card) => {
    tops.push(offset);
    card.style.top = `${offset}px`;
    const header = card.querySelector<HTMLElement>("[data-service-header]");
    if (header) {
      offset += header.getBoundingClientRect().height;
    }
  });

  const naturalHeights = cards.map((card) => {
    card.style.height = "auto";
    return card.getBoundingClientRect().height;
  });

  let maxStickyBottom = 0;
  cards.forEach((card, i) => {
    const stickyBottom = tops[i] + naturalHeights[i];
    if (stickyBottom > maxStickyBottom) {
      maxStickyBottom = stickyBottom;
    }
  });

  cards.forEach((card, i) => {
    const requiredHeight = maxStickyBottom - tops[i];
    card.style.height = `${requiredHeight}px`;
  });
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.72,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    stackServiceCards();
    const onResize = () => stackServiceCards();
    window.addEventListener("resize", onResize);
    document.fonts?.ready?.then(stackServiceCards);

    let cleanupCounterResize = () => {};

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.to(".bg-secondary-400", {
        y: () => -(window.innerHeight + 300),
        duration: 1.5,
        ease: "power4.inOut",
        delay: 0.2,
        onComplete: () => {
          gsap.set(".bg-secondary-400", { display: "none" });
        }
      }, 0);

      gsap.utils.toArray(".ease-in.opacity-0").forEach((el: any) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 1.2,
        });
      });

      gsap.to(".name-char-desktop", {
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.05,
        delay: 1.3,
      });

      // Animate the hero contact button in
      const heroContactBtn = document.querySelector('[data-hero-contact]') as HTMLElement;
      if (heroContactBtn) {
        gsap.to(heroContactBtn, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 2,
        });
      }

      gsap.utils.toArray(".overflow-hidden").forEach((container: any) => {
        if (container.querySelector(".name-char-desktop")) return;
        const spans = container.querySelectorAll(".inline-block");
        if (spans.length > 0) {
          gsap.to(spans, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            stagger: 0.02,
            scrollTrigger: {
              trigger: container,
              start: "top 90%",
              once: true,
            },
          });
        }
      });

      document
        .querySelectorAll<HTMLElement>('[style*="opacity"]')
        .forEach((el) => {
          if (
            el.style.opacity !== "0" ||
            el.classList.contains("inline-block") ||
            el.tagName.toLowerCase() === "svg" ||
            el.closest("svg") ||
            el.hasAttribute('data-hero-contact')
          ) {
            return;
          }
          gsap.to(el, {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        });

      gsap.to(".contact-footer-wrapper", {
        y: 0,
        ease: "power3.out",
        duration: 1.2,
        scrollTrigger: {
          trigger: ".contact-footer-trigger",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // Project counter scroll animation (01 → 02 → 03 etc.)
      const numberSlider = document.querySelector<HTMLElement>('[data-number-slider]');
      const projectCards = Array.from(
        document.querySelectorAll<HTMLElement>('[data-index]')
      );
      const firstDigit = numberSlider?.querySelector<HTMLElement>('[data-number-digit]');

      if (numberSlider && firstDigit && projectCards.length) {
        const projectsContainer = projectCards[0].parentElement;
        if (!projectsContainer) return;

        let digitHeight = 0;
        let activeIndex = -1;

        const updateCounter = () => {
          digitHeight = firstDigit.getBoundingClientRect().height;
          if (!digitHeight) return;

          const threshold = window.innerHeight * 0.6;
          let nextIndex = 0;

          projectCards.forEach((card, index) => {
            if (card.getBoundingClientRect().top <= threshold) {
              nextIndex = index;
            }
          });

          if (nextIndex === activeIndex) return;
          const previousIndex = activeIndex;
          activeIndex = nextIndex;

          const direction = nextIndex >= previousIndex ? 1 : -1;
          const targetY = -(activeIndex * digitHeight);

          gsap.timeline({ defaults: { overwrite: "auto" } })
            .to(numberSlider, {
              y: targetY - direction * digitHeight * 0.08,
              duration: 0.28,
              ease: "power3.out",
            })
            .to(numberSlider, {
              y: targetY,
              duration: 0.24,
              ease: "power2.out",
            });
        };

        const counterTrigger = ScrollTrigger.create({
          trigger: projectsContainer,
          start: "top bottom",
          end: "bottom top",
          onUpdate: updateCounter,
          onRefresh: updateCounter,
        });

        const onCounterResize = () => {
          activeIndex = -1;
          counterTrigger.refresh();
        };

        window.addEventListener("resize", onCounterResize);
        updateCounter();
        cleanupCounterResize = () => {
          window.removeEventListener("resize", onCounterResize);
        };
      }

      // Hero image reveal animation (clip-path + scale)
      const heroMedia = document.querySelector('[data-hero-media]') as HTMLElement;
      if (heroMedia) {
        gsap.to(heroMedia, {
          clipPath: 'inset(0 0 0% 0)',
          opacity: 1,
          scale: 1,
          duration: 2.5,
          ease: 'power2.out',
          delay: 2,
        });
      }
    });

    return () => {
      window.removeEventListener("resize", onResize);
      cleanupCounterResize();
      gsap.ticker.remove(ticker);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-[15] flex h-screen w-screen bg-secondary-400 "
      >
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 926 1000"
          preserveAspectRatio="none"
          style={{ height: "calc(100% + 300px)" }}
        >
          <path
            className="fill-secondary-400"
            d="M0 0 L926 0 L926 1000 Q463 730 0 1000 L0 0"
          ></path>
        </svg>
      </div>
      <header className="absolute top-0 z-40 w-full">
        <div className=" section-padding-x mt-[var(--space-md)] flex flex-row items-start justify-between gap-x-[var(--gap-fluid)] lg:grid lg:grid-cols-12 lg:items-center ">
          <div className="col-span-8 flex flex-col items-start gap-x-[var(--space-2xl)] gap-y-[var(--space-3xs)] lg:flex-row lg:items-center">
            <span className=" block w-fit max-w-[14ch] text-balance font-medium leading-snug text-[var(--color-secondary-100)] text-[length:var(--text-base)] sm:max-w-max md:text-[length:var(--text-base-small)] 2xl:text-[length:var(--text-base)] ">
              <div className="transition-all duration-500 ease-in transform opacity-0 ">
                Web Developer &amp; Designer
              </div>
            </span>
          </div>
          <nav className="col-span-4 flex justify-end text-[length:var(--text-base)] md:text-[length:var(--text-base-small)] 2xl:text-[length:var(--text-base)] ">
            <ul className=" m-0 flex flex-col items-start text-[var(--color-secondary-100)] gap-y-[var(--space-3xs)] md:flex-row md:items-center md:gap-x-[var(--space-2xs)] md:gap-y-0 font-medium  ">
              <div className="transition-all duration-500 ease-in transform opacity-0 ">
                <li className="flex leading-normal  md:leading-snug">
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none"
                    href="/#Services"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Services
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Services
                    </span>
                  </a>
                </li>
              </div>
              <div className="transition-all duration-500 ease-in transform opacity-0 ">
                <li className="flex leading-normal  md:leading-snug">
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none"
                    href="/#Works"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Works
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Works
                    </span>
                  </a>
                </li>
              </div>
              <div className="transition-all duration-500 ease-in transform opacity-0 ">
                <li className="flex leading-normal  md:leading-snug">
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none"
                    href="/#About"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      About
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      About
                    </span>
                  </a>
                </li>
              </div>
              <div className="transition-all duration-500 ease-in transform opacity-0 ">
                <li className="flex leading-normal  md:leading-snug">
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none"
                    href="/#Contact"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Contact
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Contact
                    </span>
                  </a>
                </li>
              </div>
            </ul>
          </nav>
        </div>
      </header>
      <section className="mb-[-100svh] py-0 ">
        <div className="section-padding-equal sticky top-0 flex h-svh items-end">
          <div className="relative flex w-full flex-col md:gap-y-[var(--space-lg)] ">
            <h1 className="text-[length:var(--text-h1)] overflow-clip">
              <div
                className="hidden w-full md:flex justify-between items-end overflow-hidden pb-[1vw] font-bold uppercase text-[var(--color-secondary-400)]"
                style={{ fontFamily: "var(--font-montreal), sans-serif", fontSize: "11.2vw", lineHeight: "0.85" }}
              >
                {"THE JYOTIRMAY".split("").map((char, index) => (
                  <span
                    key={index}
                    className="name-char-desktop inline-block"
                    style={{ transform: "translateY(100%)" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
              <span className="flex flex-col text-[length:var(--text-heading-display)] font-semibold uppercase leading-[80%] tracking-[var(--tracking-heading)] text-[var(--color-secondary-400)] md:hidden">
                <div className="block w-full overflow-hidden whitespace-nowrap">
                  <span className="" style={{ opacity: "0" }}>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      T
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      H
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      E
                    </span>
                    {/* <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      E
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      D
                    </span> */}
                  </span>
                </div>
                <div className="block w-full overflow-hidden whitespace-nowrap">
                  <span className="" style={{ opacity: "0" }}>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      J
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      Y
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      O
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      T
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      I
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      R
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      M
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      A
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      Y
                    </span>
                  </span>
                </div>
              </span>
            </h1>
            <div className="relative grid w-full grid-cols-12 justify-between gap-x-[var(--gap-fluid)] gap-y-[var(--space-md)]">
              <div className="col-span-12 flex flex-col justify-between gap-y-[var(--space-2xl)] pt-[var(--space-sm)] md:col-span-4 md:gap-y-[var(--space-md)]">
                <div className="grid-gap flex flex-col gap-[var(--space-md)] md:gap-y-[var(--space-xl)]">
                  <div className="hidden overflow-clip md:block">
                    <span className="block" style={{ opacity: "0" }}>
                      <svg
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="1.25"
                        viewBox="6 6 12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="m-0 size-4 p-0 md:size-6"
                        style={{ color: "#8C8C73" }}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line x1="7" y1="7" x2="17" y2="17"></line>
                        <polyline points="17 7 17 17 7 17"></polyline>
                      </svg>
                    </span>
                  </div>
                  <div className="flex flex-col gap-y-[var(--space-sm)] md:gap-y-[var(--space-md)]">
                    <div className="w-full max-w-[32ch] text-balance text-[length:var(--text-base)] font-medium leading-snug text-[var(--color-secondary-100)] xl:text-[length:var(--text-base-large)] 3xl:text-[length:var(--text-heading-body)]">
                      <div className="overflow-hidden">
                        <span className="break-words">
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            build
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            fast,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            modern
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            websites
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            that
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            help
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            businesses
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            grow,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            available
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            for
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            freelance
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            projects
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            worldwide.
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="overflow-clip">
                      <div
                        data-hero-contact
                        className="transition-all duration-500"
                        style={{ opacity: "0", transform: "translateY(100px)" }}
                      >
                        <a href="#Contact">
                          <button className="group pointer-events-auto relative flex h-fit w-fit items-center justify-center overflow-hidden rounded-full bg-[var(--color-secondary-300)] px-[var(--space-md)] sm:py-[var(--space-sm)] py-[var(--space-xs)] font-bold uppercase tracking-wide text-[#f1f0ed] sm:text-[length:var(--text-base)] text-[length:var(--text-base-small)]">
                            <span className="absolute inset-0 z-10 block overflow-hidden">
                              <span className="block h-full w-full translate-y-full rounded-t-[15rem] bg-[var(--color-accent-600)] transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] sm:group-hover:translate-y-0 sm:group-hover:rounded-none"></span>
                            </span>
                            <span className="relative z-20 block overflow-hidden transition-all">
                              <span
                                className="block after:absolute after:left-0 after:block after:translate-y-0 after:transition-all after:duration-500 after:ease-[cubic-bezier(0.77,0,0.175,1)] after:content-[attr(data-after)] sm:group-hover:after:-translate-y-full"
                                data-after={"CONTACT \u2197\uFE0E"}
                              >
                                <span className="flex transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] sm:group-hover:-translate-y-full">
                                  CONTACT {"\u2197\uFE0E"}
                                </span>
                              </span>
                            </span>
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex flex-col items-start md:items-center">
                <div className="flex h-fit w-fit flex-col items-center justify-center gap-y-[var(--space-2xs)] overflow-hidden rounded-md">
                  <div
                    data-hero-media
                    className="pointer-events-none h-[15vh] max-w-lg rounded-lg md:h-[50vh]"
                    style={{
                      clipPath: "inset(0 0 100% 0)",
                      opacity: "0",
                      scale: "1.3",
                    }}
                  >
                    <video
                      src="/hero.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover object-center grayscale"
                    />
                  </div>
                </div>
              </div>
              <div className="end-1 col-span-8 flex w-full flex-col items-end justify-end md:col-span-4">
                <div className="overflow-clip">
                  <span className="block max-w-[15ch] text-right font-mono text-[length:var(--text-base-small)] font-medium uppercase leading-snug tracking-[var(--tracking-mono)] text-[--color-secondary-100] md:max-w-max 3xl:text-[length:var(--text-base)]">
                    <div className="overflow-hidden">
                      <span className="">
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          Available
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          for
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          work
                        </span>
                      </span>
                    </div>
                  </span>
                </div>
                <div className="overflow-clip">
                  <span className="block text-[length:var(--text-heading-2)] font-semibold uppercase leading-none tracking-[var(--tracking-heading)] text-[var(--color-secondary-300)] sm:text-[length:var(--text-heading-1--alt)] 3xl:text-[length:var(--text-heading-1)]">
                    <div className="overflow-hidden">
                      <span className="">
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          {new Date().toLocaleString('en-US', { month: 'short' })}&apos;{new Date().getFullYear().toString().slice(-2)}
                        </span>
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-svh"></div>
      </section>
      <div className="relative z-[10] min-h-screen w-full overflow-x-clip">
        <section id="Services">
          <div className="relative">
            <button
              className="fixed top-9 right-8 z-[99999999] p-3 bg-[var(--color-accent-400)] rounded-full shadow-lg"
              style={{ cursor: "pointer", opacity: "0", transform: "scale(0)" }}
            >
              <svg width="35" height="35" viewBox="0 0 35 35">
                <line
                  x1="2"
                  y1="13.5"
                  x2="33"
                  y2="13.5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: "17.5px 17.5px" }}
                ></line>
                <line
                  x1="2"
                  y1="21.5"
                  x2="33"
                  y2="21.5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: "17.5px 17.5px" }}
                ></line>
              </svg>
            </button>
          </div>
          <div className="relative z-20 min-h-screen w-full overflow-x-clip">
            <section className="section-padding rounded-t-3xl bg-[var(--color-secondary-400)] text-[var(--color-text-bg)]">
              <div className="relative flex w-full flex-col gap-y-[var(--space-lg)] md:gap-y-[var(--space-2xl)]">
                <h1 className="hidden cs2:text-[length:var(--text-h1)] section-heading col-span-6 max-w-[18ch] text-accent-400 md:block">
                  <div className="overflow-hidden">
                    <span className="" style={{ opacity: "0" }}>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        W
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        h
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        a
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        t
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >

                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        I
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >

                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        D
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        o
                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >

                      </span>
                      <span
                        className="inline-block"
                        style={{ opacity: "0", transform: "translateY(100%)" }}
                      >
                        /
                      </span>
                    </span>
                  </div>
                </h1>
                <h1 className="section-heading text-[length:var(--text-h1)] text-accent-400 md:hidden">
                  What I Do /
                </h1>
                <div className="flex grid-cols-12 gap-x-[var(--gap-fluid)] md:grid">
                  <div className="col-span-7 flex flex-col gap-x-[var(--space-xl)] gap-y-[var(--space-2xs)] sm:flex-row md:col-start-6">
                    <span className="flex h-full font-medium uppercase text-nowrap text-[var(--color-secondary-75)] text-[16px]">
                      (Services)
                    </span>
                    <div className="w-full max-w-[35ch] text-balance text-[length:var(--text-base-large)] font-medium leading-base text-[var(--color-secondary-50)]">
                      <div className="overflow-hidden">
                        <span className="">
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            specialize
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            in
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            building
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            fast,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            reliable,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            user-friendly
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            full-stack
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            web
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            applications.
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            help
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            small
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            businesses
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            startups
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            turn
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            ideas
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            into
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            high-quality
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            websites
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            products
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            that
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            actually
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            work
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            scale.
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full pt-[var(--space-lg)]">
                <div className="service-stack mt-12 flex flex-col justify-between bg-[var(--color-secondary-400)] pb-[50vh]">
                  <div
                    data-service-card="1"
                    className="sticky border-t border-t-[var(--color-secondary-300)] bg-[var(--color-secondary-400)]"
                  >
                    <div data-service-header className="flex grid-cols-12 items-center justify-start gap-x-[var(--space-xs)] text-left text-[length:var(--text-heading-2)] font-semibold text-[var(--color-accent-400)] md:grid md:justify-between md:gap-x-[var(--gap-fluid)]">
                      <span className="col-span-2">(01)</span>
                      <h3 className="col-span-8 col-start-6 py-[var(--space-md)] 2xl:py-[var(--space-sm)]">
                        Full-Stack Development{/*   */}{" "}
                      </h3>
                    </div>
                    <div className="grid-gap relative flex min-h-[30vh] flex-col place-items-start pt-[var(--space-3xs)] md:grid md:min-h-[40vh] md:grid-cols-12">
                      <div className="col-span-7 col-start-6 flex w-full flex-col gap-y-[var(--space-sm)] pt-[var(--space-sm)] text-[length:var(--text-heading-4)]">
                        <p className="max-w-[40ch] text-balance text-[length:var(--text-base)] font-medium text-[var(--color-secondary-50)]">
                          From frontend interactions to backend APIs, I build
                          complete web solutions. I work with modern stacks to
                          deliver apps that are scalable, maintainable, and
                          ready for real-world users.{/*   */}{" "}
                        </p>
                        <div className="flex flex-col divide-y divide-[var(--color-secondary-200)]">
                          <span className=" flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)] text-[length:var(--text-heading-4)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}1
                            </span>
                            React, Node.js, Express.js{/*   */}{" "}
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}2
                            </span>
                            REST APIs, Firebase, Docker
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}3
                            </span>
                            Git, GitHub, Postman
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    data-service-card="2"
                    className="sticky border-t border-t-[var(--color-secondary-300)] bg-[var(--color-secondary-400)]"
                  >
                    <div data-service-header className="flex grid-cols-12 items-center justify-start gap-x-[var(--space-xs)] text-left text-[length:var(--text-heading-2)] font-semibold text-[var(--color-accent-400)] md:grid md:justify-between md:gap-x-[var(--gap-fluid)]">
                      <span className="col-span-2">(02)</span>
                      <h3 className="col-span-8 col-start-6 py-[var(--space-md)] 2xl:py-[var(--space-sm)]">
                        UI/UX &amp; Frontend
                      </h3>
                    </div>
                    <div className="grid-gap relative flex min-h-[30vh] flex-col place-items-start pt-[var(--space-3xs)] md:grid md:min-h-[40vh] md:grid-cols-12">
                      <div className="col-span-7 col-start-6 flex w-full flex-col gap-y-[var(--space-sm)] pt-[var(--space-sm)] text-[length:var(--text-heading-4)]">
                        <p className="max-w-[40ch] text-balance text-[length:var(--text-base)] font-medium text-[var(--color-secondary-50)]">
                          Good design feels effortless. I design and develop
                          responsive, intuitive interfaces that work smoothly
                          across devices, with a strong focus on clarity,
                          accessibility, and performance.
                        </p>
                        <div className="flex flex-col divide-y divide-[var(--color-secondary-200)]">
                          <span className=" flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)] text-[length:var(--text-heading-4)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}1
                            </span>
                            NextJs, TailwindCSS, GSAP
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}2
                            </span>
                            Figma → Pixel-perfect code
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}3
                            </span>
                            HTML, CSS, JavaScript
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    data-service-card="3"
                    className="sticky border-t border-t-[var(--color-secondary-300)] bg-[var(--color-secondary-400)]"
                  >
                    <div data-service-header className="flex grid-cols-12 items-center justify-start gap-x-[var(--space-xs)] text-left text-[length:var(--text-heading-2)] font-semibold text-[var(--color-accent-400)] md:grid md:justify-between md:gap-x-[var(--gap-fluid)]">
                      <span className="col-span-2">(03)</span>
                      <h3 className="col-span-8 col-start-6 py-[var(--space-md)] 2xl:py-[var(--space-sm)]">
                        Optimization
                      </h3>
                    </div>
                    <div className="grid-gap relative flex min-h-[30vh] flex-col place-items-start pt-[var(--space-3xs)] md:grid md:min-h-[40vh] md:grid-cols-12">
                      <div className="col-span-7 col-start-6 flex w-full flex-col gap-y-[var(--space-sm)] pt-[var(--space-sm)] text-[length:var(--text-heading-4)]">
                        <p className="max-w-[40ch] text-balance text-[length:var(--text-base)] font-medium text-[var(--color-secondary-50)]">
                          I focus on building systems that stay reliable as
                          things scale. From handling data efficiently to
                          designing clean architecture, I apply core computer
                          science principles to keep applications fast, stable,
                          and future-ready.{/*   */}{" "}
                        </p>
                        <div className="flex flex-col divide-y divide-[var(--color-secondary-200)]">
                          <span className=" flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)] text-[length:var(--text-heading-4)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}1
                            </span>
                            Data Structures &amp; Algorithms
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}2
                            </span>
                            DBMS, OOP, OS Fundamentals
                          </span>
                          <span className="flex items-start gap-x-[var(--space-sm)] py-[var(--space-3xs)] font-bold text-[var(--color-accent-500)] xl:gap-x-[var(--space-md)] xl:py-[var(--space-2xs)]">
                            <span className="font-mono text-[length:var(--text-base)] font-medium leading-[200%] text-[var(--color-secondary-75)]">
                              0{/*   */}3
                            </span>
                            Scalable systems &amp; data pipelines
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
        <section id="Works">
          <div className="section-padding bg-[var(--color-secondary-400)]">
            <div className="flex flex-col gap-y-[var(--space-lg)] md:gap-y-[var(--space-2xl)]">
              <h1 className="hidden section-heading relative text-[var(--color-accent-400)] md:block">
                <div className="overflow-hidden">
                  <span className="" style={{ opacity: "0" }}>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      S
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      E
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      L
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      E
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      C
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      T
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      E
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      D
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >

                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      W
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      O
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      R
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      K
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      S
                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >

                    </span>
                    <span
                      className="inline-block"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      /
                    </span>
                  </span>
                </div>
              </h1>
              <h1 className="section-heading relative text-[var(--color-accent-400)] md:hidden">
                Selected<br />Works /
              </h1>
              <div className="grid-gap flex grid-cols-12 sm:justify-end lg:grid">
                <div className="col-span-7 col-start-1 flex flex-col gap-x-[var(--space-xl)] gap-y-[var(--space-2xs)] sm:col-start-6 sm:flex-row">
                  <span className="flex h-full font-medium uppercase text-nowrap text-[var(--color-secondary-75)]">
                    (PROJECTS)
                  </span>
                  <div className="w-full max-w-[25ch] text-balance font-medium leading-base text-[var(--color-secondary-50)] text-[length:var(--text-base-large)]">
                    <div className="overflow-hidden">
                      <span className="">
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          Thoughtfully
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          crafted
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          digital
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          experiences
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          that
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          blend
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          utility
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          and
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          aesthetics
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          into
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          something
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          functional,
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          memorable,
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          and
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          refined.
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-gap grid grid-cols-12 pt-[var(--space-lg)]">
              <div className="sticky top-12 col-span-5 hidden h-fit w-full text-[22vw] font-normal leading-none text-[var(--color-secondary-50)] md:flex">
                <span className="block shrink-0 leading-none">0</span>
                <div
                  className="relative block shrink-0 overflow-hidden"
                  style={{ width: "0.65em", height: "1em" }}
                >
                  <div
                  data-number-slider
                  className="absolute left-0 top-0 flex w-full flex-col"
                  style={{ transform: "translateY(0%)" }}
                  >
                  <span data-number-digit className="block shrink-0 leading-none" style={{ height: "1em" }}>1</span>
                  <span className="block shrink-0 leading-none" style={{ height: "1em" }}>2</span>
                  <span className="block shrink-0 leading-none" style={{ height: "1em" }}>3</span>
                  <span className="block shrink-0 leading-none" style={{ height: "1em" }}>4</span>
                  <span className="block shrink-0 leading-none" style={{ height: "1em" }}>5</span>
                  </div>
                </div>
              </div>
              <aside className="relative col-span-12 flex flex-col gap-y-[var(--space-xl)] md:col-span-7 md:gap-y-[var(--space-2xl)]">
                <div className="@container " data-index="0">
                  <a
                    href="https://drive.google.com/drive/folders/1Fqqn5USxU1f51Ruo8G9BVQTJanWqC6ew?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="custom-cursor-area relative mt-5 flex aspect-square items-center justify-center overflow-clip rounded-md bg-[var(--color-secondary-300)] p-[var(--space-md)] sm:p-[var(--space-lg)] xl:p-[var(--space-2xl)]">
                      <video
                        src="/partner-plus-bottom.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="z-10 aspect-[4/3] w-full overflow-clip rounded-lg">
                        <img
                          src="/partner-plus-top.png"
                          alt="Partner+ Dashboard"
                          className="aspect-[4/3] w-full rounded-lg object-cover"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-y-[var(--space-sm)] pt-[var(--space-xs)] lg:flex-row">
                      <div className="flex flex-col gap-y-[var(--space-3xs)]">
                        <span className="font-mono text-var(--text-base-small) font-medium text-[var(--color-secondary-50)]">
                          <h1 className="font-mono cursor-default ">
                            B2B SAAS Platform
                          </h1>
                        </span>
                        <div className="w-fit text-[length:var(--text-heading-3)] font-semibold text-[var(--color-accent-400)]">
                          <h1 className="font-mono cursor-default ">Partner+</h1>
                        </div>
                      </div>
                      <div className="flex items-end gap-x-[var(--space-3xs)] tracking-base text-[var(--color-secondary-50)]">
                        <span className="tag">Development</span>
                        <span className="tag">System-Design</span>
                        <span className="tag border-[var(--color-secondary-50)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-400)]">
                          2025
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="@container " data-index="1">
                  <a
                    href="https://github.com/theJyotirmay/trao-weather"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="custom-cursor-area relative mt-5 flex aspect-square items-center justify-center overflow-clip rounded-md bg-[var(--color-secondary-300)] p-[var(--space-md)] sm:p-[var(--space-lg)] xl:p-[var(--space-2xl)]">
                      <video
                        src="/weather-ai-bottom.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="z-10 aspect-[4/3] w-full overflow-clip rounded-lg">
                        <img
                          src="/weather-ai-top.png"
                          alt="Weather AI Dashboard"
                          className="aspect-[4/3] w-full rounded-lg object-cover"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-y-[var(--space-sm)] pt-[var(--space-xs)] lg:flex-row">
                      <div className="flex flex-col gap-y-[var(--space-3xs)]">
                        <span className="font-mono text-var(--text-base-small) font-medium text-[var(--color-secondary-50)]">
                          <h1 className="font-mono cursor-default ">
                            An AI Powered weather application
                          </h1>
                        </span>
                        <div className="w-fit text-[length:var(--text-heading-3)] font-semibold text-[var(--color-accent-400)]">
                          <h1 className="font-mono cursor-default ">Weather AI</h1>
                        </div>
                      </div>
                      <div className="flex items-end gap-x-[var(--space-3xs)] tracking-base text-[var(--color-secondary-50)]">
                        <span className="tag">Development</span>
                        <span className="tag">AI</span>
                        <span className="tag border-[var(--color-secondary-50)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-400)]">
                          2025
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="@container " data-index="2">
                  <a
                    href="/re"
                  >
                    <div className="custom-cursor-area relative mt-5 flex aspect-square items-center justify-center overflow-clip rounded-md bg-[var(--color-secondary-300)] p-[var(--space-md)] sm:p-[var(--space-lg)] xl:p-[var(--space-2xl)]">
                      <video
                        src="/real-estate-websites-bottom.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="z-10 aspect-[4/3] w-full overflow-clip rounded-lg">
                        <img
                          src="/real-estate-websites-top.png"
                          alt="Real estate websites"
                          className="aspect-[4/3] w-full rounded-lg object-cover object-left"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-y-[var(--space-sm)] pt-[var(--space-xs)] lg:flex-row">
                      <div className="flex flex-col gap-y-[var(--space-3xs)]">
                        <span className="font-mono text-var(--text-base-small) font-medium text-[var(--color-secondary-50)]">
                          <h1 className="font-mono cursor-default ">
                            Curated Sites
                          </h1>
                        </span>
                        <div className="w-fit text-[length:var(--text-heading-3)] font-semibold text-[var(--color-accent-400)]">
                          <h1 className="font-mono cursor-default ">
                            Real Estate Websites
                          </h1>
                        </div>
                      </div>
                      <div className="flex items-end gap-x-[var(--space-3xs)] tracking-base text-[var(--color-secondary-50)]">
                        <span className="tag">UI/UX</span>
                        <span className="tag">Web-Design</span>
                        <span className="tag border-[var(--color-secondary-50)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-400)]">
                          2026
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="@container " data-index="3">
                  <a
                    href="/new"
                  >
                    <div className="custom-cursor-area relative mt-5 flex aspect-square items-center justify-center overflow-clip rounded-md bg-[var(--color-secondary-300)] p-[var(--space-md)] sm:p-[var(--space-lg)] xl:p-[var(--space-2xl)]">
                      <video
                        src="/inspirations-bottom.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="z-10 aspect-[4/3] w-full overflow-clip rounded-lg">
                        <img
                          src="/inspirations-top.jpg"
                          alt="Curated experience"
                          className="aspect-[4/3] w-full rounded-lg object-cover"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-y-[var(--space-sm)] pt-[var(--space-xs)] lg:flex-row">
                      <div className="flex flex-col gap-y-[var(--space-3xs)]">
                        <span className="font-mono text-var(--text-base-small) font-medium text-[var(--color-secondary-50)]">
                          <h1 className="font-mono cursor-default ">
                            Inspiration
                          </h1>
                        </span>
                        <div className="w-fit text-[length:var(--text-heading-3)] font-semibold text-[var(--color-accent-400)]">
                          <h1 className="font-mono cursor-default ">Curated experience</h1>
                        </div>
                      </div>
                      <div className="flex items-end gap-x-[var(--space-3xs)] tracking-base text-[var(--color-secondary-50)]">
                        <span className="tag">Development</span>
                        <span className="tag">Design</span>
                        <span className="tag border-[var(--color-secondary-50)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-400)]">
                          2026
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                {/*
                <div className="@container " data-index="4">
                  <a
                    href="https://code2img-jyotirmay.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="custom-cursor-area relative mt-5 flex aspect-square items-center justify-center overflow-clip rounded-md bg-[var(--color-secondary-300)] p-[var(--space-md)] sm:p-[var(--space-lg)] xl:p-[var(--space-2xl)]">
                      <div>
                        <div style={{ width: "100%", height: "100%" }}></div>
                      </div>
                      <div className="z-10 aspect-[4/3] w-full overflow-clip rounded-lg">
                        <div className="aspect-[4/3] w-full rounded-lg bg-gray-100 overflow-hidden"></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-y-[var(--space-sm)] pt-[var(--space-xs)] lg:flex-row">
                      <div className="flex flex-col gap-y-[var(--space-3xs)]">
                        <span className="font-mono text-var(--text-base-small) font-medium text-[var(--color-secondary-50)]">
                          <h1 className="font-mono cursor-default ">
                            Code-to-Image Tool
                          </h1>
                        </span>
                        <div className="w-fit text-[length:var(--text-heading-3)] font-semibold text-[var(--color-accent-400)]">
                          <h1 className="font-mono cursor-default ">
                            Code2Img
                          </h1>
                        </div>
                      </div>
                      <div className="flex items-end gap-x-[var(--space-3xs)] tracking-base text-[var(--color-secondary-50)]">
                        <span className="tag">Development</span>
                        <span className="tag border-[var(--color-secondary-50)] bg-[var(--color-secondary-50)] text-[var(--color-secondary-400)]">
                          2025
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
                */}
              </aside>
            </div>
          </div>
        </section>
        <section id="About" className="mt-[-2vh]">
          <div className="z-[999999] relative">
            <div className="section-padding sm:pb-[10em] pb-[5em] flex flex-col gap-y-[var(--space-lg)] rounded-b-3xl bg-[var(--color-secondary-400)] lg:gap-y-[var(--space-2xl)] md:pt-[15vh]">
              <div className="custom-grid">
                <h2 className="section-heading cs5:text-[length:var(--text-h1-display)] text-[length:var(--text-menu)] relative z-30 flex w-full flex-col col-span-full leading-none text-[var(--color-accent-400)] mix-blend-exclusion lg:col-span-8 lg:col-end-7 mt-[1em] mb-[1em] order-2 md:order-1">
                  <span>
                    <div className="overflow-hidden">
                      <span className="" style={{ opacity: "0" }}>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          D
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          V
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          L
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          O
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          P
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          R
                        </span>
                      </span>
                    </div>
                  </span>
                  <span>
                    <div className="overflow-hidden">
                      <span className="" style={{ opacity: "0" }}>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          D
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          S
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          I
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          G
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          N
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          R
                        </span>
                      </span>
                    </div>
                  </span>
                  <span>
                    <div className="overflow-hidden">
                      <span className="" style={{ opacity: "0" }}>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          C
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          R
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          E
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          A
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          T
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          O
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          R
                        </span>
                        <span
                          className="inline-block"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          /
                        </span>
                      </span>
                    </div>
                  </span>
                </h2>
                <div className="relative z-0 lg:col-span-6 col-span-full flex  w-full items-center overflow-clip rounded-md  md:items-end order-1 md:order-2">
                  <section className="self-start md:px-6 py-5 c370:px-3 px-0 bg-[var(--color-secondary-400)] text-[var(--color-accent-400)] w-full">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="md:text-[length:var(--text-h1-alt)] text-[length:var(--text-menu)] font-bold mb-8 text-center">
                        Skills
                      </h2>
                      <div className="grid grid-cols-3 md:grid-cols-3 c343:gap-1 gap-0 md:gap-5 md:p-5 c370:p-1 p-0">
                        <div className=" c370:p-2 p-0  rounded-2xl shadow-md  hover:shadow-lg transition self-start">
                          <h3 className="flex text-[length:var(--text-base)] font-semibold mb-4 md:text-xl">
                            Languages &amp; Tools
                          </h3>
                          <ul className="space-y-3  md:text-base">
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Python
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Python
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    SQL
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    SQL
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    C++
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    C++
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Java
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Java
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Typescript
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Typescript
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    JavaScript
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    JavaScript
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Git
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Git
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Postman
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Postman
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Docker
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Docker
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Firebase
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Firebase
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2 text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  <h1 className="font-mono cursor-default">MongoDB</h1>
                                </span>
                                <span aria-hidden="true" className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0">
                                  <h1 className="font-mono cursor-default">MongoDB</h1>
                                </span>
                              </span>
                            </div>
                          </ul>
                        </div>
                        <div className=" c370:p-2 p-0  rounded-2xl shadow-md  hover:shadow-lg transition self-start">
                          <h3 className="flex text-[length:var(--text-base)] font-semibold mb-4 md:text-xl">
                            Frameworks &amp; Libraries
                          </h3>
                          <ul className="space-y-3  md:text-base">
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    React
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    React
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Node.js
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Node.js
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Express.js
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Express.js
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Flask
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Flask
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Bootstrap
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Bootstrap
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    jQuery
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    jQuery
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    TailwindCSS
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    TailwindCSS
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Framer Motion
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Framer Motion
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    GSAP
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    GSAP
                                  </h1>
                                </span>
                              </span>
                            </div>
                          </ul>
                        </div>
                        <div className=" c370:p-2 p-0  rounded-2xl shadow-md  hover:shadow-lg transition self-start">
                          <h3 className="flex text-[length:var(--text-base)] font-semibold mb-4 md:text-xl">
                            Core CS Concepts
                          </h3>
                          <ul className="space-y-3  md:text-base">
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    DSA
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    DSA
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    DBMS
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    DBMS
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    OOP
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    OOP
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Operating Systems
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    Operating Systems
                                  </h1>
                                </span>
                              </span>
                            </div>
                            <div className="flex relative items-start gap-2  text-[var(--color-secondary-50)] c343:text-[length:var(--text-base)] text-[length:var(--text-skill)]">
                              <span className="group relative block h-fit   overflow-hidden font-medium select-none">
                                <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    System Design
                                  </h1>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                                >
                                  {" "}
                                  <h1 className="font-mono cursor-default ">
                                    System Design
                                  </h1>
                                </span>
                              </span>
                            </div>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <div className="custom-grid col-span-full gap-y-[var(--space-lg)] lg:gap-y-[var(--space-2xl)]">
                <div className="pointer-events-none relative z-0 col-span-3 flex aspect-[4/5] max-h-[30rem] w-full items-center overflow-clip rounded-md md:items-end">
                  <video
                    src="/hero.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label="Curated digital experience in motion"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="col-span-7 col-start-6 flex flex-col gap-y-[var(--space-xl)] lg:gap-y-[var(--space-2xl)]">
                  <div className="relative w-full max-w-[39ch] text-balance text-[length:var(--text-heading-4)] font-medium leading-snug text-[var(--color-accent-400)]">
                    <div className="overflow-hidden">
                      <span className="">
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          I&#x27;m
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          a
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          software
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          engineer
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          driven
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          by
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          a
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          passion
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          for
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          turning
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          ideas
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          into
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          clean,
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          intuitive
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          digital
                        </span>
                        <span
                          className="inline-block pr-2"
                          style={{
                            opacity: "0",
                            transform: "translateY(100%)",
                          }}
                        >
                          experiences.
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-x-[var(--space-xl)] gap-y-[var(--space-sm)] lg:flex-row">
                    <span className="flex h-fit overflow-clip font-mono tracking-[var(--tracking-mono)]">
                      <span className="flex h-full font-medium uppercase text-nowrap text-[var(--color-secondary-50)]">
                        <div className="overflow-hidden">
                          <span className="" style={{ opacity: "0" }}>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              (
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              A
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              b
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              o
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              u
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              t
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >

                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              M
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              e
                            </span>
                            <span
                              className="inline-block"
                              style={{
                                opacity: "0",
                                transform: "translateY(100%)",
                              }}
                            >
                              )
                            </span>
                          </span>
                        </div>
                      </span>
                    </span>
                    <div className="flex w-full gap-y-4 max-w-[38ch] flex-col text-balance text-[length:var(--text-base)] font-medium leading-base text-[var(--color-secondary-50)]">
                      <div className="overflow-hidden">
                        <span className="">
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I’m
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            a
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            full-stack
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            developer
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            who
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            builds
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            fast,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            modern
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            web
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            applications
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            mostly
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            with
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            Next.js
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            Tailwind
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            CSS
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            because
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            they
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            just
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            work.
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            work
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            with
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            businesses
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            and
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            startups
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            to
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            turn
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            ideas
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            into
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            reliable,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            user-friendly
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            products
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            built
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            to
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            scale.
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          ></span>
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <span className="">
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            I&#x27;ve
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            been
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            building
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            websites
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            long
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            enough
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            to
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            have
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            strong
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            opinions
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            about
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            things
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            that
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            don&#x27;t
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            matter
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            to
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            most
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            people,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            like
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            whether
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            a
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            transition
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            should
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            be
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            150ms
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            or
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            200ms.
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            (It&#x27;s
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            150ms,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            btw).
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            Build
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            the
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            thing,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            make
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            it
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            work,
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            make
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            it
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            feel
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            good.
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            That&#x27;s
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            the
                          </span>
                          <span
                            className="inline-block pr-2"
                            style={{
                              opacity: "0",
                              transform: "translateY(100%)",
                            }}
                          >
                            gig.
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="contact-footer-trigger">
          <div className="contact-footer-wrapper section-padding-x translate-y-[-20vh] sm:translate-y-[-80vh] py-[var(--space-lg)]">
            <div className="relative flex h-full w-full flex-col items-center justify-between rounded-md bg-[linear-gradient(0deg,_#393632,_#080807)] bg-cover  border border-white/10 shadow-lg backdrop-blur-xl p-[var(--space-md)]">
              <h2 className="max-w-[10ch] text-center text-[length:var(--text-heading-1)] font-semibold uppercase text-[var(--color-accent-400)]">
                <div className="overflow-hidden">
                  <span className="">
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      Let&#x27;s
                    </span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    ></span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    ></span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      Make
                    </span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    ></span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      It
                    </span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    ></span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    >
                      Happen
                    </span>
                    <span
                      className="inline-block pr-2"
                      style={{ opacity: "0", transform: "translateY(100%)" }}
                    ></span>
                  </span>
                </div>
              </h2>
              <section
                id="Contact"
                className="sm:w-[36rem] w-[100%]  mx-auto my-10 px-6 sm:px-10 xl:px-14 py-12 rounded-2xl backdrop-blur-xl bg-[rgba(209,209,199,0.05)] border border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
              >
                <h2 className="text-center text-[length:var(--text-h4)] font-medium mb-8 text-[var(--color-accent-200)] tracking-tight">
                  Have a project in mind?{/*   */}{" "}
                </h2>
                <form noValidate className="space-y-4 gform" onSubmit={handleContactSubmit}>
                  <input
                    type="text"
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    name="hp"
                  />
                  <div>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full placeholder:font-[400] font-normal text-[length:var(--text-base)] rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-[var(--color-text-bg)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50"
                      name="name"
                      defaultValue=""
                      disabled={isSubmitting || isSubmitted}
                    />
                    <p className="text-red-400 text-sm mt-1 h-5 transition-all duration-300 opacity-0 invisible"></p>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full placeholder:font-[400]  text-[length:var(--text-base)] font-normal rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-[var(--color-text-bg)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50"
                      name="email"
                      defaultValue=""
                      disabled={isSubmitting || isSubmitted}
                    />
                    <p className="text-red-400 text-sm mt-1 transition-all duration-300 opacity-0 invisible">
                      Placeholder
                    </p>
                  </div>
                  <div>
                    <textarea
                      name="message"
                      placeholder="Tell me about your business or project"
                      rows={5}
                      required
                      className="w-full placeholder:font-[400] font-normal rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-[var(--color-text-bg)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none disabled:opacity-50"
                      disabled={isSubmitting || isSubmitted}
                    ></textarea>
                    <p className="text-red-400 text-sm mt-1 h-5 transition-all duration-300 opacity-0 invisible"></p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="
    w-full
    px-6 py-3 rounded-xl font-semibold tracking-wide text-[length:var(--text--small)]
    transition-all duration-300

    bg-[var(--color-accent-200)] text-black hover:bg-white active:scale-[0.98] active:shadow-inner
    disabled:opacity-70 disabled:cursor-not-allowed
  "
                  >
                    {isSubmitting ? "Sending..." : isSubmitted ? "Message Sent! ✓" : "Get a quote"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>
        <div className="section-padding-equal relative flex flex-col items-center justify-center gap-y-[var(--space-xl)] py-[var(--space-lg)]">
          <div className="grid-gap grid w-full grid-cols-2 gap-y-[var(--space-md)] text-[length:var(--text-base)] md:grid-cols-12">
            <div className="flex flex-col md:col-span-6">
              <h3 className="mb-[var(--space-xs)] flex border-b-[1.5px] border-[var(--color-accent-500)] pb-[var(--space-2xs)] font-bold tracking-base text-[var(--color-secondary-300)]">
                Menu
              </h3>
              <ul className="flex flex-col gap-y-[var(--space-3xs)]">
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    href="/"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Home
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Home
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    href="#Services"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Services
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Services
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    href="#Works"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Works
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Works
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    href="#About"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      About
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      About
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    href="#Contact"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Contact
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Contact
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col md:col-span-3">
              <h3 className="mb-[var(--space-xs)] flex border-b-[1.5px] border-[var(--color-accent-500)] pb-[var(--space-2xs)] font-bold tracking-base text-[var(--color-secondary-300)]">
                Socials
              </h3>
              <ul className="flex flex-col gap-y-[var(--space-3xs)]">
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.linkedin.com/in/thejs781/"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Linkedin
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Linkedin
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.instagram.com/thejs.dev?vrfl=NXQ4cGRzZjFkM3Bs&utm_source=qr"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Instagram
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Instagram
                    </span>
                  </a>
                </li>
                <li>
                  {" "}
                  <a
                    className="group relative block h-fit  overflow-hidden font-medium cursor-pointer select-none flex w-fit leading-base text-[var(--color-secondary-100)] sm:leading-snug"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/theJyotirmay"
                  >
                    <span className="block w-full transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-0 group-hover:-translate-y-full">
                      Github
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-full block transition-transform duration-[0.4s] ease-[cubic-bezier(.51,.92,.24,1.15)] translate-y-full group-hover:translate-y-0"
                    >
                      Github
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="grid-gap flex w-full items-end justify-between md:grid md:grid-cols-12">
            <span className="flex  font-[500] flex-col text-[length:var(--text-heading-3)]  leading-tight tracking-[var(--tracking-heading)] text-[var(--color-secondary-300)] sm:order-first sm:text-[length:var(--text-heading-3)] md:col-span-6"></span>
            <div className="flex flex-col text-[length:var(--text-base-small)] md:col-span-3">
              <span className="font-bold uppercase text-[var(--color-secondary-300)]">
                Local time
              </span>
              <span className="font-mono font-medium uppercase tracking-[var(--tracking-mono)] text-[var(--color-secondary-100)]">
                <span className="font-mono font-medium uppercase tracking-[var(--tracking-mono)] text-[var(--color-secondary-100)]">
                  <LocalTime />
                </span>
              </span>
            </div>
            <div className="hidden h-fit w-full justify-end md:col-span-3 md:flex">
              <div className="w-fit" style={{ transform: "none" }}>
                {" "}
                <button
                  aria-label="Scroll to top"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="group relative hidden w-fit flex-col items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent-500)] p-[var(--space-lg)] duration-1000 ease-expo hover:scale-90 md:flex"
                >
                  <span className="absolute flex transition-all duration-500 ease-in-out-cubic group-hover:-translate-y-20">
                    <img
                      alt="Scroll to top arrow"
                      loading="lazy"
                      width="26"
                      height="28"
                      decoding="async"
                      style={{ color: "transparent" }}
                      src="/window.svg"
                    />
                  </span>
                  <span className="absolute flex translate-y-20 transition-all duration-500 ease-in-out-cubic group-hover:translate-y-0">
                    <img
                      alt="Scroll to top arrow"
                      loading="lazy"
                      width="26"
                      height="28"
                      decoding="async"
                      style={{ color: "transparent" }}
                      src="/window.svg"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* $ */}
      {/* /$ */}
      {/* $ */}
      {/* /$ */}
    </>
  );
}
