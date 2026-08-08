import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      data-testid="about-section"
      className="py-24 lg:py-40 px-6 md:px-12 lg:px-24 border-t border-[var(--border-color)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24" ref={ref}>
        <div>
          <motion.p
            className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            Sobre a Marca
          </motion.p>
          <motion.h2
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[var(--text-primary)] leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            AQUI
            <br />
            <span className="text-brand-red">FORJAMOS</span>
            <br />
            TENDÊNCIA
          </motion.h2>
        </div>

        <div className="flex flex-col justify-center">
          <motion.p
            className="text-base lg:text-lg leading-relaxed text-[var(--text-secondary)] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            A TREND FORGE nasceu da obsessão pelos detalhes que transformam uma peça comum em algo memorável.

Criamos streetwear premium com design autoral, qualidade sem concessões e identidade em cada coleção. Não seguimos tendências. Nós criamos peças que contam histórias e carregam significado.

Cada detalhe é pensado para quem entende que estilo vai além do que se veste, é atitude, é personalidade, É expressão.
          </motion.p>
          <motion.p
            className="text-base lg:text-lg leading-relaxed text-[var(--text-secondary)] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            TREND FORGE, FORJANDO TENDÊNCIAS.
          </motion.p>
          <motion.div
            className="flex gap-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div>
              <p className="font-heading text-3xl font-black text-[var(--text-primary)]">01</p>
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-1">Season</p>
            </div>
        
            <div>
              <p className="font-heading text-3xl font-black text-brand-red">100%</p>
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-1">Premium</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
