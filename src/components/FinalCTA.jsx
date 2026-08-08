import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      data-testid="final-cta-section"
      className="py-32 lg:py-48 px-6 md:px-12 lg:px-24 text-center border-t border-[var(--border-color)] bg-[var(--bg-primary)]"
      ref={ref}
    >
      

      <motion.h2
        className="font-heading text-4xl sm:text-5xl lg:text-[6vw] font-black tracking-tighter text-[var(--text-primary)] leading-none mb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        TREND FORGE
        <br />
      </motion.h2>

      <motion.p
        className="text-base lg:text-lg text-[var(--text-secondary)] max-w-lg mx-auto mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Garanta suas pe&ccedil;as antes que esgotem.
      </motion.p>

      <motion.a
        href="#collection"
        data-testid="final-cta-button"
        className="inline-block bg-brand-red text-white px-12 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Comprar Agora
      </motion.a>
    </section>
  );
}
