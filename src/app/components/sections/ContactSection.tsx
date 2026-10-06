"use client";

// Next / Contact (§6.7 / Phase 7). The headline sits over the live time in
// Makati, huge and outlined. No glow, no sweep, no second dial.
import React, { useCallback, useState } from "react";
import { soundFx } from "@/util/sound";
import { copy } from "@/content/copy";
import Dual from "@/components/system/Dual";
import { LuCopy, LuCheck, LuMail, LuArrowUpRight, LuPrinter } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import TimeGhost from "../system/TimeGhost";
import LoadTime from "../system/LoadTime";

interface ContactSectionProps {
  onCopyEmail?: () => void;
}

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;
type SubmitStatus = "idle" | "composing" | "opened";

const EMAIL = "jlrneverida@gmail.com";

function validate(data: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = "Name is required.";
  if (!data.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (!data.message.trim()) errors.message = "Message is required.";
  return errors;
}

export default function ContactSection({ onCopyEmail }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleCopy = useCallback(() => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    onCopyEmail?.();
    setTimeout(() => setCopied(false), 2200);
  }, [onCopyEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(formData);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("composing");
    soundFx.playSuccess();
    const mailtoUrl = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Message from ${formData.name}`
    )}&body=${encodeURIComponent(`Hi Jake,\n\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`)}`;

    window.setTimeout(() => {
      window.location.href = mailtoUrl;
      setStatus("opened");
    }, 300);
  };

  const submitLabel = status === "composing" ? "Composing…" : status === "opened" ? "Mail client opened" : "Compose Message";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="reveal-item relative px-4 sm:px-6 pt-8 sm:pt-12 max-w-4xl mx-auto pb-16"
    >
      <div className="relative mb-8 py-24 text-center sm:py-32">
        {/* The time in Makati, huge and outlined, behind the headline. */}
        <TimeGhost className="absolute inset-x-0 top-1/2 -translate-y-1/2" />
        <h2 id="contact-heading" className="relative text-h1 font-display text-ink tracking-tight">
          Time to <span className="italic text-summit">talk.</span>
        </h2>
        <Dual
          value={copy.contact.invite}
          note="none"
          className="relative mt-3 text-sm sm:text-[1.0625rem] text-ink-2 font-sans max-w-[52ch] mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Direct Links */}
        <div className="md:col-span-5 bg-surface border border-line rounded-2xl p-5 space-y-4">
          <div>
            <span className="text-[11px] font-mono text-moss block mb-1">&bull; Open for Opportunities</span>
            <h3 className="font-sans font-semibold text-base text-ink">Get in Touch</h3>
          </div>

          <div className="p-3 rounded-xl bg-raised border border-line">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-ink-2 truncate">{EMAIL}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-void hover:bg-raised text-ink-2 hover:text-ink transition-colors shrink-0 cursor-pointer"
                title="Copy email"
              >
                {copied ? <LuCheck className="w-3.5 h-3.5 text-moss" /> : <LuCopy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <a
            href="https://github.com/neverida-jk"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFx.playClick(900)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-raised/40 hover:bg-raised text-ink-2 hover:text-ink border border-line transition-colors text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <SiGithub className="w-3.5 h-3.5" />
              <span>github.com/neverida-jk</span>
            </div>
            <LuArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick(900);
              window.print();
            }}
            className="flex w-full items-center justify-between p-2.5 rounded-xl bg-raised/40 hover:bg-raised text-ink-2 hover:text-ink border border-line transition-colors text-xs font-mono cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LuPrinter className="w-3.5 h-3.5" />
              <span>Print or save résumé</span>
            </div>
            <LuArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <Dual value={copy.contact.availability} className="text-[11px] font-mono text-ink-3 pt-1" />
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-7 bg-surface border border-line rounded-2xl p-5">
          <h3 className="font-sans font-semibold text-base text-ink mb-1">Send a Message</h3>
          <p className="text-xs text-ink-2 font-sans mb-2">
            Opens your default email client with your message pre-filled.
          </p>
          <Dual value={copy.contact.invite} note="only" className="mb-4" />

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="contact-name" className="block text-[11px] font-mono text-ink-2 mb-1">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-xl bg-raised border border-line text-ink placeholder-ink-3 text-xs focus:border-alpine outline-none transition-colors font-sans"
                />
                <p id="contact-name-error" aria-live="polite" className="min-h-[1rem] text-[11px] text-alert mt-1">
                  {errors.name}
                </p>
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-[11px] font-mono text-ink-2 mb-1">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-raised border border-line text-ink placeholder-ink-3 text-xs focus:border-alpine outline-none transition-colors font-sans"
                />
                <p id="contact-email-error" aria-live="polite" className="min-h-[1rem] text-[11px] text-alert mt-1">
                  {errors.email}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-[11px] font-mono text-ink-2 mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={3}
                value={formData.message}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full px-3 py-2 rounded-xl bg-raised border border-line text-ink placeholder-ink-3 text-xs focus:border-alpine outline-none transition-colors font-sans resize-none"
              />
              <p id="contact-message-error" aria-live="polite" className="min-h-[1rem] text-[11px] text-alert mt-1">
                {errors.message}
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "composing"}
              className="w-full py-2.5 px-4 rounded-xl bg-summit text-void font-sans font-medium text-xs hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {status === "opened" ? <LuCheck className="w-3.5 h-3.5" /> : <LuMail className="w-3.5 h-3.5" />}
              <span>{submitLabel}</span>
            </button>
          </form>
        </div>
      </div>


      <footer className="mt-10 pt-6 border-t border-line text-center text-xs font-mono text-ink-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>
            Jake Neverida &bull; <span className="text-ink">UP Los Baños</span>
          </span>
          <span className="hidden sm:inline text-ink-3">&bull;</span>
          <span className="text-ink-3">Built with Next.js 15, React 19, and Tailwind CSS v4.</span>
        </div>
        <LoadTime template={copy.common.loadTime} />
      </footer>
    </section>
  );
}
