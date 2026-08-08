import { motion } from "framer-motion";

const phrases = [
  "FORJADO PELOS DEUSES",
  "O OLIMPO DESPERTOU",
  "VISTA O PODER",
  "NÃO É MODA, É MITOLOGIA.",
  "MITOLOGIA URBANA",
  "OVERSIZED PREMIUM",
];

const doubled = [...phrases, ...phrases, ...phrases, ...phrases];

export default function Marquee() {
  return (
    <section data-testid="marquee-section" className="py-6 sm:py-8 overflow-hidden border-y border-[var(--border-color)]">
      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex shrink-0 items-center gap-6 sm:gap-8"
          animate={{ x: [0, -(phrases.length * 400)] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        >
          {doubled.map((text, i) => (
            <span key={i} className="flex items-center gap-6 sm:gap-8 shrink-0">
              <span className="font-heading text-xl sm:text-3xl lg:text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase whitespace-nowrap">
                {text}
              </span>
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-brand-red rotate-45 shrink-0" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
