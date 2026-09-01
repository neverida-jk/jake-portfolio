"use client";

import React, { useState, useCallback } from "react";
import { soundFx } from "@/util/sound";
import { LuCopy, LuCheck, LuMail, LuArrowUpRight } from "react-icons/lu";
import { SiGithub, SiLinkedin } from "react-icons/si";

interface CallToActionSectionProps {
  onCopyEmail?: () => void;
}

export default function CallToActionSection({ onCopyEmail }: CallToActionSectionProps) {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);

  const handleCopy = useCallback(() => {
    soundFx.playSuccess();
    navigator.clipboard.writeText("jlrneverida@gmail.com");
    setCopied(true);
    if (onCopyEmail) onCopyEmail();
    setTimeout(() => setCopied(false), 2200);
  }, [onCopyEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    const mailtoUrl = `mailto:jlrneverida@gmail.com?subject=${encodeURIComponent(
      `Message from ${formData.name}`
    )}&body=${encodeURIComponent(
      `Hi Jake,\n\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
    )}`;
    window.location.href = mailtoUrl;
    setFormSent(true);
  };

  return (
    <section id="contact" className="reveal-item px-4 sm:px-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/[0.06]">
        <h2 className="text-xl sm:text-2xl font-bold font-rubik text-zinc-100 tracking-tight">
          Contact
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Direct Links */}
        <div className="md:col-span-5 glass-card rounded-2xl p-5 space-y-4">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 block mb-1">
              &bull; Open for Opportunities
            </span>
            <h3 className="font-rubik font-semibold text-base text-white">
              Get in Touch
            </h3>
            <p className="text-xs text-zinc-400 font-rubik leading-relaxed mt-1">
              Currently available for software engineering roles, web development projects, or technical conversations.
            </p>
          </div>

          {/* Direct Email Box */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-zinc-300 truncate">
                jlrneverida@gmail.com
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
                title="Copy email"
              >
                {copied ? (
                  <LuCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <LuCopy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-1.5 pt-1">
            <a
              href="https://github.com/neverida-jk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playClick(900)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/[0.04] transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <SiGithub className="w-3.5 h-3.5" />
                <span>github.com/neverida-jk</span>
              </div>
              <LuArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playClick(900)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/[0.04] transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <SiLinkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn Profile</span>
              </div>
              <LuArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 pt-1">
            Timezone: GMT+8 (Manila)
          </p>
        </div>

        {/* Right Column: Direct Message */}
        <div className="md:col-span-7 glass-card rounded-2xl p-5">
          <h3 className="font-rubik font-semibold text-base text-white mb-1">
            Send a Message
          </h3>
          <p className="text-xs text-zinc-400 font-rubik mb-4">
            Directly opens your default email client with your message pre-filled.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    soundFx.playKey();
                  }}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-white placeholder-zinc-600 text-xs focus:border-zinc-500 outline-none transition-colors font-rubik"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    soundFx.playKey();
                  }}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-white placeholder-zinc-600 text-xs focus:border-zinc-500 outline-none transition-colors font-rubik"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  soundFx.playKey();
                }}
                placeholder="Write your message here..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-white placeholder-zinc-600 text-xs focus:border-zinc-500 outline-none transition-colors font-rubik resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-rubik font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <LuMail className="w-3.5 h-3.5" />
              <span>Compose Message</span>
            </button>

            {formSent && (
              <p className="text-xs text-emerald-400 font-mono text-center pt-1">
                Mail client draft opened.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
