"use client"
import { useState } from "react";

interface CTAButton {
  label: string;
  href: string;
  variant: "primary" | "black";
}

const ctaButtons: CTAButton[] = [
  {
    label: "অভিযোগ জানান",
    href: "/complain-forum",
    variant: "black",
  },
  {
    label: "সহায়তা নিন",
    href: "/user-stories",
    variant: "primary",
  },
];

export default function HeroSection() {
    return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

        .hero-section {
          font-family: 'Noto Sans Bengali', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: var(--background);
          padding-block: var(--section-spacing);
        }

        .hero-container {
          width: 100%;
          max-width: var(--container-width);
          margin-inline: auto;
          padding-inline: 1.5rem;
        }

        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2rem;
          max-width: 820px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--muted-foreground);
        }

        .hero-eyebrow::before {
          content: "";
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 999px;
          background: var(--primary);
          flex-shrink: 0;
        }

        .hero-headline {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: clamp(2rem, 5vw, 3.75rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--foreground);
          margin: 0;
          white-space: pre-line;
        }

        .hero-headline .highlight {
          color: var(--primary);
        }

        .hero-divider {
          width: 3rem;
          height: 3px;
          border-radius: 999px;
          background: var(--primary);
          flex-shrink: 0;
        }

        .hero-subheading {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          font-weight: 400;
          line-height: 1.75;
          color: var(--muted-foreground);
          max-width: 640px;
          margin: 0;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: 'Noto Sans Bengali', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1;
          padding: 0.875rem 1.75rem;
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          cursor: pointer;
          text-decoration: none;
          transition:
            background-color 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            transform 150ms ease;
          white-space: nowrap;
        }

        .cta-btn:active {
          transform: translateY(1px);
        }

        .cta-btn-black {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
        }

        .cta-btn-black:hover {
          background: var(--accent);
          color: var(--accent-foreground);
          border-color: var(--accent);
        }

        .cta-btn-primary {
          background: transparent;
          color: var(--foreground);
          border-color: var(--border);
        }

        .cta-btn-primary:hover {
          // background: var(--foreground);
          // color: var(--background);
          border-color: var(--foreground);
        }

        .btn-arrow {
          display: inline-block;
          transition: transform 180ms ease;
        }

        .cta-btn:hover .btn-arrow {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .hero-headline {
            font-size: clamp(1.75rem, 7vw, 2.5rem);
          }

          .hero-cta-group {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .cta-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-btn,
          .btn-arrow {
            transition: none;
          }
        }
      `}</style>

      <section className="hero-section" aria-label="Hero section">
        <div className="hero-container">
          <div className="hero-inner">
            <h1 className="hero-headline">
              হেনস্থার শিকার? <span className="highlight">চুপ থাকবেন না</span>,{"\n"}
              ন্যায়ের পথে পাশে আছি, <span className="highlight">ভয় পাবেন না!</span>
            </h1>

            <div className="hero-divider" aria-hidden="true" />

            <p className="hero-subheading">
              আপনার অভিজ্ঞতা জানান, সহায়তা নিন এবং অন্যায়ের বিরুদ্ধে আওয়াজ তুলুন, কারণ আপনার নিরাপত্তা, মর্যাদা ও ন্যায়বিচারের পথে আপনি একা নন।
            </p>

            <div className="hero-cta-group">
              {ctaButtons.map((btn, i) => (
                <a
                  key={btn.href}
                  href={btn.href}
                  className={`cta-btn cta-btn-${btn.variant}`}
                  aria-label={btn.label}
                >
                  {btn.label}
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}