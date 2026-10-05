"use client"

import { useState } from "react";
import { ChevronRight, ChevronLeft, Scale, AlertTriangle, FileText, Building2, ArrowRight, RotateCcw, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "role" | "behaviour" | "platform" | "result";

interface Punishment {
  applies_to: string;
  imprisonment_max_years?: number;
  fine_max_taka?: number;
  fine_max_text?: string;
  penalty_type: string;
  same_as_principal_offence?: boolean;
  highest_of_principal_offences?: boolean;
}

interface LawResult {
  source: "cyber" | "other";
  section?: number;
  title_bn: string;
  law_name?: string;
  sections_ref?: string | null;
  punishments: Punishment[];
  status_note?: string;
  note?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: "victim", label: "আমি ক্ষতিগ্রস্ত ব্যক্তি", desc: "কেউ আমার বিরুদ্ধে এই কাজ করেছে" },
  { id: "reporter", label: "আমি অভিযোগকারী", desc: "অন্যের পক্ষে বা সাক্ষী হিসেবে জানাতে চাই" },
  { id: "accused", label: "আমার বিরুদ্ধে অভিযোগ আছে", desc: "আমি কী ধারায় পড়তে পারি জানতে চাই" },
];

const PLATFORMS = [
  { id: "social", label: "সোশ্যাল মিডিয়া", desc: "Facebook, TikTok, Instagram ইত্যাদি" },
  { id: "messaging", label: "মেসেজিং / কল", desc: "WhatsApp, SMS, ফোন কল" },
  { id: "email", label: "ই-মেইল বা অনলাইন ফোরাম" },
  { id: "hacking", label: "হ্যাকিং / সিস্টেম অ্যাক্সেস", desc: "অ্যাকাউন্ট বা ডিভাইসে অননুমোদিত প্রবেশ" },
  { id: "financial", label: "আর্থিক প্রতারণা", desc: "মোবাইল ব্যাংকিং, ই-লেনদেন" },
];

const BEHAVIOURS = [
  {
    id: "defamation",
    label: "মানহানি বা মিথ্যা অভিযোগ",
    desc: "অনলাইনে মিথ্যা তথ্য ছড়িয়ে সম্মান নষ্ট করা",
    laws: [
      {
        source: "other" as const,
        title_bn: "মানহানি ও মিথ্যা অভিযোগ",
        law_name: "দণ্ডবিধি, ১৮৬০",
        sections_ref: "ধারা ৪৯৯–৫০০",
        punishments: [{ applies_to: "মানহানি", penalty_type: "কারাদণ্ড বা জরিমানা" }],
      },
    ],
  },
  {
    id: "threat",
    label: "হুমকি, ব্ল্যাকমেইল বা ভীতি প্রদর্শন",
    desc: "অনলাইনে ভয় দেখানো বা চাপ সৃষ্টি করা",
    laws: [
      {
        source: "other" as const,
        title_bn: "হুমকি ও ভীতি প্রদর্শন",
        law_name: "দণ্ডবিধি, ১৮৬০",
        sections_ref: "ধারা ৫০৩–৫০৭",
        punishments: [{ applies_to: "হুমকি ও ব্ল্যাকমেইল", penalty_type: "কারাদণ্ড বা জরিমানা" }],
      },
      {
        source: "cyber" as const,
        section: 22,
        title_bn: "সাইবার স্পেসে প্রতারণা",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
  {
    id: "sexual_harassment",
    label: "যৌন হয়রানি (অনলাইন)",
    desc: "নারীর শালীনতা ক্ষুণ্ন করা বা যৌন হয়রানি",
    laws: [
      {
        source: "other" as const,
        title_bn: "নারীর শালীনতা ক্ষুণ্ন করা",
        law_name: "দণ্ডবিধি, ১৮৬০",
        sections_ref: "ধারা ৫০৯",
        punishments: [{ applies_to: "যৌন হয়রানি", penalty_type: "কারাদণ্ড বা জরিমানা" }],
      },
      {
        source: "other" as const,
        title_bn: "নারী ও শিশুদের অনলাইন যৌন হয়রানি",
        law_name: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০ (সংশোধিত ২০০৩)",
        sections_ref: null,
        punishments: [{ applies_to: "নারী ও শিশু", penalty_type: "বিশেষ আদালতে বিচারযোগ্য" }],
      },
    ],
  },
  {
    id: "revenge_porn",
    label: "সম্মতি ছাড়া ঘনিষ্ঠ ছবি / ভিডিও শেয়ার",
    desc: "প্রতিশোধমূলক পর্নোগ্রাফি বা যৌন ব্ল্যাকমেইল",
    laws: [
      {
        source: "other" as const,
        title_bn: "সম্মতিহীন অন্তরঙ্গ কনটেন্ট প্রকাশ",
        law_name: "পর্নোগ্রাফি নিয়ন্ত্রণ আইন, ২০১২",
        sections_ref: null,
        punishments: [{ applies_to: "সম্মতিহীন প্রকাশ", penalty_type: "কারাদণ্ড ও জরিমানা" }],
      },
      {
        source: "cyber" as const,
        section: 22,
        title_bn: "সাইবার স্পেসে প্রতারণা",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
  {
    id: "child_harm",
    label: "শিশুর ক্ষতি বা অনলাইন নির্যাতন",
    desc: "শিশুদের বিরুদ্ধে অনলাইনে যেকোনো ক্ষতিকর কাজ",
    laws: [
      {
        source: "other" as const,
        title_bn: "শিশুদের অনলাইন নির্যাতন",
        law_name: "শিশু আইন, ২০১৩",
        sections_ref: null,
        punishments: [{ applies_to: "শিশু সুরক্ষা", penalty_type: "বিশেষ আদালতে বিচারযোগ্য" }],
      },
      {
        source: "other" as const,
        title_bn: "শিশুর প্রতি যৌন হয়রানি",
        law_name: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০ (সংশোধিত ২০০৩)",
        sections_ref: null,
        punishments: [{ applies_to: "শিশু নির্যাতন", penalty_type: "বিশেষ ট্রাইব্যুনালে বিচারযোগ্য" }],
      },
    ],
  },
  {
    id: "hate_speech",
    label: "ধর্মীয় বা জাতিগত ঘৃণামূলক বক্তব্য",
    desc: "সাইবারস্পেসে বিদ্বেষমূলক প্রচার",
    laws: [
      {
        source: "cyber" as const,
        section: 26,
        title_bn: "সাইবার স্পেসে ধর্মীয় বা জাতিগত ঘৃণামূলক তথ্য প্রকাশ",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 2,
            fine_max_taka: 1000000,
            fine_max_text: "১০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
  {
    id: "hacking",
    label: "হ্যাকিং বা অননুমোদিত সিস্টেম প্রবেশ",
    desc: "অ্যাকাউন্ট, ডিভাইস বা নেটওয়ার্কে অবৈধ প্রবেশ",
    laws: [
      {
        source: "cyber" as const,
        section: 17,
        title_bn: "গুরুত্বপূর্ণ তথ্য অবকাঠামোতে বেআইনি প্রবেশ",
        punishments: [
          {
            applies_to: "দফা (ক) — অ্যাক্সেস",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
          {
            applies_to: "দফা (খ) — ডেটা ধ্বংস / পরিবর্তন",
            imprisonment_max_years: 7,
            fine_max_taka: 10000000,
            fine_max_text: "১ কোটি",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
      {
        source: "cyber" as const,
        section: 18,
        title_bn: "কম্পিউটার বা ডিভাইসে বেআইনি প্রবেশ (হ্যাকিং)",
        punishments: [
          {
            applies_to: "দফা (ক) — সাধারণ অ্যাক্সেস",
            imprisonment_max_years: 1,
            fine_max_taka: 1000000,
            fine_max_text: "১০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
          {
            applies_to: "দফা (গ) — হ্যাকিং ও ডেটা ক্ষতি",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
      {
        source: "cyber" as const,
        section: 19,
        title_bn: "কম্পিউটার সিস্টেম বা অবকাঠামোর ক্ষতিসাধন",
        punishments: [
          {
            applies_to: "উপধারা (১) — সকল দফা",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
  {
    id: "fraud",
    label: "সাইবার জালিয়াতি বা আর্থিক প্রতারণা",
    desc: "ডিজিটাল মাধ্যমে অর্থ বা তথ্য চুরি",
    laws: [
      {
        source: "cyber" as const,
        section: 21,
        title_bn: "সাইবার স্পেসে জালিয়াতি",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 2,
            fine_max_taka: 2000000,
            fine_max_text: "২০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
      {
        source: "cyber" as const,
        section: 22,
        title_bn: "সাইবার স্পেসে প্রতারণা",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
      {
        source: "cyber" as const,
        section: 24,
        title_bn: "অননুমোদিত ই-লেনদেন",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 1,
            fine_max_taka: 1000000,
            fine_max_text: "১০ লাখ",
            penalty_type: "কারাদণ্ড এবং অর্থদণ্ড (উভয়)",
          },
        ],
      },
    ],
  },
  {
    id: "terrorism",
    label: "সাইবার সন্ত্রাস",
    desc: "রাষ্ট্রের নিরাপত্তা বা অবকাঠামোয় আক্রমণ",
    laws: [
      {
        source: "cyber" as const,
        section: 23,
        title_bn: "সাইবার সন্ত্রাস",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 10,
            fine_max_taka: 10000000,
            fine_max_text: "১ কোটি",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
  {
    id: "telecom_abuse",
    label: "হয়রানির জন্য ফোন / টেলিযোগাযোগের অপব্যবহার",
    desc: "কল বা নেটওয়ার্কের মাধ্যমে হয়রানি",
    laws: [
      {
        source: "other" as const,
        title_bn: "টেলিযোগাযোগ নেটওয়ার্কের অপব্যবহার",
        law_name: "বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ আইন, ২০০১",
        sections_ref: null,
        punishments: [{ applies_to: "হয়রানিমূলক যোগাযোগ", penalty_type: "কারাদণ্ড ও জরিমানা" }],
      },
    ],
  },
  {
    id: "obscene_content",
    label: "অশ্লীল বা মানহানিকর ইলেকট্রনিক কনটেন্ট",
    desc: "ডিজিটাল মাধ্যমে অশ্লীল বা আপত্তিকর উপকরণ প্রকাশ",
    laws: [
      {
        source: "other" as const,
        title_bn: "অশ্লীল ইলেকট্রনিক কনটেন্ট",
        law_name: "তথ্য ও যোগাযোগ প্রযুক্তি আইন, ২০০৬",
        sections_ref: "ধারা ৫৭",
        status_note: "বর্তমানে বাতিল এবং সাইবার আইন দ্বারা প্রতিস্থাপিত",
        punishments: [{ applies_to: "অশ্লীল প্রকাশনা", penalty_type: "সাইবার আইনের অধীনে বিচারযোগ্য" }],
      },
      {
        source: "cyber" as const,
        section: 22,
        title_bn: "সাইবার স্পেসে প্রতারণা / ক্ষতিকর কনটেন্ট",
        punishments: [
          {
            applies_to: "উপধারা (১)",
            imprisonment_max_years: 5,
            fine_max_taka: 5000000,
            fine_max_text: "৫০ লাখ",
            penalty_type: "কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড",
          },
        ],
      },
    ],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function getMaxImprisonment(laws: LawResult[]): number {
  let max = 0;
  for (const law of laws) {
    for (const p of law.punishments) {
      if (p.imprisonment_max_years && p.imprisonment_max_years > max) {
        max = p.imprisonment_max_years;
      }
    }
  }
  return max;
}

function getSeverityLabel(years: number): { label: string; level: "low" | "medium" | "high" | "critical" } {
  if (years === 0) return { label: "নির্ধারিত নয়", level: "low" };
  if (years <= 2) return { label: "লঘু", level: "low" };
  if (years <= 5) return { label: "মধ্যম", level: "medium" };
  if (years <= 7) return { label: "গুরুতর", level: "high" };
  return { label: "অতি গুরুতর", level: "critical" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ["ভূমিকা", "আচরণ", "মাধ্যম", "ফলাফল"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2.5rem" }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem" }}>
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: done ? "#171717" : active ? "#e63b2e" : "transparent",
                  color: done || active ? "#fff" : "#6f6e69",
                  border: done || active ? "none" : "1.5px solid #d9d7d0",
                  flexShrink: 0,
                  transition: "all 200ms ease",
                }}
              >
                {done ? <Check size={12} /> : idx}
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#171717" : "#6f6e69",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: done ? "#171717" : "#d9d7d0",
                  margin: "0 0.5rem",
                  marginBottom: "1.125rem",
                  transition: "background 200ms ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}

function OptionCard({ selected, onClick, label, desc }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "1rem 1.25rem",
        borderRadius: "0.625rem",
        border: selected ? "2px solid #171717" : "1.5px solid #d9d7d0",
        background: selected ? "#171717" : "#fff",
        color: selected ? "#fff" : "#171717",
        cursor: "pointer",
        transition: "all 150ms ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.4, marginBottom: desc ? "0.25rem" : 0 }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: "0.8rem", color: selected ? "rgba(255,255,255,0.65)" : "#6f6e69", lineHeight: 1.5 }}>
            {desc}
          </div>
        )}
      </div>
      {selected && <Check size={16} style={{ flexShrink: 0 }} />}
    </button>
  );
}

function LawCard({ law }: { law: LawResult }) {
  const isCyber = law.source === "cyber";
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d9d7d0",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #d9d7d0",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "0.375rem",
            background: isCyber ? "#171717" : "#f7f6f2",
            border: isCyber ? "none" : "1px solid #d9d7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isCyber ? (
            <Scale size={14} color="#fff" />
          ) : (
            <FileText size={14} color="#171717" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {isCyber && law.section && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "#e63b2e",
                  background: "rgba(230,59,46,0.08)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(230,59,46,0.2)",
                }}
              >
                ধারা {law.section}
              </span>
            )}
            {law.sections_ref && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#6f6e69",
                  background: "#f7f6f2",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "999px",
                  border: "1px solid #d9d7d0",
                }}
              >
                {law.sections_ref}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginTop: "0.375rem", lineHeight: 1.4, color: "#171717" }}>
            {law.title_bn}
          </div>
          {law.law_name && (
            <div style={{ fontSize: "0.78rem", color: "#6f6e69", marginTop: "0.2rem" }}>
              {law.law_name}
            </div>
          )}
          {law.status_note && (
            <div
              style={{
                fontSize: "0.73rem",
                color: "#e63b2e",
                marginTop: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <AlertTriangle size={11} /> {law.status_note}
            </div>
          )}
        </div>
      </div>
      {/* Punishments */}
      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {law.punishments.map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#6f6e69", fontWeight: 500 }}>{p.applies_to}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {p.imprisonment_max_years && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: "#f7f6f2",
                    border: "1px solid #d9d7d0",
                    borderRadius: "0.375rem",
                    padding: "0.3rem 0.7rem",
                    color: "#171717",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  সর্বোচ্চ {p.imprisonment_max_years} বছর কারাদণ্ড
                </span>
              )}
              {p.fine_max_text && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: "#f7f6f2",
                    border: "1px solid #d9d7d0",
                    borderRadius: "0.375rem",
                    padding: "0.3rem 0.7rem",
                    color: "#171717",
                  }}
                >
                  সর্বোচ্চ {p.fine_max_text} টাকা জরিমানা
                </span>
              )}
              {!p.imprisonment_max_years && !p.fine_max_text && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#6f6e69",
                    fontStyle: "italic",
                  }}
                >
                  {p.penalty_type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SituationFinder() {
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedBehaviour, setSelectedBehaviour] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const selectedBehaviourData = BEHAVIOURS.find((b) => b.id === selectedBehaviour);

  const handleReset = () => {
    setStep(1);
    setSelectedRole(null);
    setSelectedBehaviour(null);
    setSelectedPlatform(null);
  };

  const maxYears = selectedBehaviourData ? getMaxImprisonment(selectedBehaviourData.laws as LawResult[]) : 0;
  const severity = getSeverityLabel(maxYears);

  const severityColors = {
    low: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    medium: { bg: "#fefce8", text: "#a16207", border: "#fde68a" },
    high: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
    critical: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
  };
  const sc = severityColors[severity.level];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f6f2",
        fontFamily: '"Noto Sans Bengali", sans-serif',
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "#6f6e69",
              marginBottom: "0.875rem",
            }}
          >
            <span
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "999px",
                background: "#e63b2e",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            সাইবার আইন তথ্যকেন্দ্র
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#171717",
              marginBottom: "0.625rem",
            }}
          >
            আমার পরিস্থিতিতে কোন আইন প্রযোজ্য?
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#6f6e69", lineHeight: 1.7, maxWidth: "520px" }}>
            কয়েকটি প্রশ্নের উত্তর দিন — আপনার পরিস্থিতি অনুযায়ী প্রযোজ্য বাংলাদেশি সাইবার আইনের ধারা দেখুন।
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} />

        {/* ── Step 1: Role ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#171717", marginBottom: "0.375rem" }}>
                আপনার ভূমিকা কী?
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#6f6e69" }}>
                আপনি কোন পরিপ্রেক্ষিতে তথ্য খুঁজছেন তা বেছে নিন।
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.75rem" }}>
              {ROLES.map((r) => (
                <OptionCard
                  key={r.id}
                  selected={selectedRole === r.id}
                  onClick={() => setSelectedRole(r.id)}
                  label={r.label}
                  desc={r.desc}
                />
              ))}
            </div>
            <button
              onClick={() => selectedRole && setStep(2)}
              disabled={!selectedRole}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.625rem",
                border: "2px solid transparent",
                background: selectedRole ? "#171717" : "#d9d7d0",
                color: selectedRole ? "#fff" : "#6f6e69",
                fontFamily: '"Noto Sans Bengali", sans-serif',
                fontSize: "1rem",
                fontWeight: 600,
                cursor: selectedRole ? "pointer" : "not-allowed",
                transition: "all 150ms ease",
              }}
            >
              পরবর্তী ধাপ <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── Step 2: Behaviour ── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#171717", marginBottom: "0.375rem" }}>
                কী ধরনের ঘটনা ঘটেছে?
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#6f6e69" }}>
                আপনার পরিস্থিতির সবচেয়ে কাছের বিকল্পটি বেছে নিন।
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.75rem" }}>
              {BEHAVIOURS.map((b) => (
                <OptionCard
                  key={b.id}
                  selected={selectedBehaviour === b.id}
                  onClick={() => setSelectedBehaviour(b.id)}
                  label={b.label}
                  desc={b.desc}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.875rem 1.25rem",
                  borderRadius: "0.625rem",
                  border: "1.5px solid #d9d7d0",
                  background: "transparent",
                  color: "#171717",
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} /> পেছনে
              </button>
              <button
                onClick={() => selectedBehaviour && setStep(3)}
                disabled={!selectedBehaviour}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  flex: 1,
                  padding: "0.875rem 1.75rem",
                  borderRadius: "0.625rem",
                  border: "2px solid transparent",
                  background: selectedBehaviour ? "#171717" : "#d9d7d0",
                  color: selectedBehaviour ? "#fff" : "#6f6e69",
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: selectedBehaviour ? "pointer" : "not-allowed",
                  transition: "all 150ms ease",
                }}
              >
                পরবর্তী ধাপ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Platform ── */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#171717", marginBottom: "0.375rem" }}>
                কোন মাধ্যমে ঘটনাটি ঘটেছে?
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#6f6e69" }}>
                যে প্ল্যাটফর্ম বা মাধ্যমটি ব্যবহৃত হয়েছে সেটি বেছে নিন।
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.75rem" }}>
              {PLATFORMS.map((p) => (
                <OptionCard
                  key={p.id}
                  selected={selectedPlatform === p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  label={p.label}
                  desc={p.desc}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.875rem 1.25rem",
                  borderRadius: "0.625rem",
                  border: "1.5px solid #d9d7d0",
                  background: "transparent",
                  color: "#171717",
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} /> পেছনে
              </button>
              <button
                onClick={() => selectedPlatform && setStep(4)}
                disabled={!selectedPlatform}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  flex: 1,
                  padding: "0.875rem 1.75rem",
                  borderRadius: "0.625rem",
                  border: "2px solid transparent",
                  background: selectedPlatform ? "#e63b2e" : "#d9d7d0",
                  color: selectedPlatform ? "#fff" : "#6f6e69",
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: selectedPlatform ? "pointer" : "not-allowed",
                  transition: "all 150ms ease",
                }}
              >
                ফলাফল দেখুন <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Result ── */}
        {step === 4 && selectedBehaviourData && (
          <div>
            {/* Summary bar */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #d9d7d0",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#6f6e69", marginBottom: "0.375rem", fontWeight: 500 }}>
                  নির্বাচিত পরিস্থিতি
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#171717", lineHeight: 1.35 }}>
                  {selectedBehaviourData.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6f6e69", marginTop: "0.25rem" }}>
                  {ROLES.find((r) => r.id === selectedRole)?.label} ·{" "}
                  {PLATFORMS.find((p) => p.id === selectedPlatform)?.label}
                </div>
              </div>
              {maxYears > 0 && (
                <div
                  style={{
                    padding: "0.375rem 0.875rem",
                    borderRadius: "0.5rem",
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    color: sc.text,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <AlertTriangle size={13} />
                  {severity.label} — সর্বোচ্চ {maxYears} বছর
                </div>
              )}
            </div>

            {/* Applicable laws count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Building2 size={15} color="#6f6e69" />
              <span style={{ fontSize: "0.85rem", color: "#6f6e69" }}>
                <strong style={{ color: "#171717" }}>{selectedBehaviourData.laws.length}টি</strong> প্রযোজ্য আইনি ধারা পাওয়া গেছে
              </span>
            </div>

            {/* Law cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {selectedBehaviourData.laws.map((law, i) => (
                <LawCard key={i} law={law as LawResult} />
              ))}
            </div>

            {/* Disclaimer */}
            <div
              style={{
                background: "rgba(230,59,46,0.04)",
                border: "1px solid rgba(230,59,46,0.15)",
                borderRadius: "0.625rem",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={16} color="#e63b2e" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
              <p style={{ fontSize: "0.8rem", color: "#6f6e69", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#171717" }}>দ্রষ্টব্য:</strong> এই তথ্য শুধুমাত্র সাধারণ জ্ঞানের জন্য। নির্দিষ্ট পরামর্শের জন্য একজন যোগ্য আইনজীবীর সাথে পরামর্শ করুন। ধারার নম্বর ও বর্তমান স্থিতি অফিসিয়াল গেজেটের সাথে যাচাই করুন।
              </p>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.875rem 1.75rem",
                borderRadius: "0.625rem",
                border: "1.5px solid #d9d7d0",
                background: "transparent",
                color: "#171717",
                fontFamily: '"Noto Sans Bengali", sans-serif',
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <RotateCcw size={16} /> নতুন অনুসন্ধান শুরু করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}