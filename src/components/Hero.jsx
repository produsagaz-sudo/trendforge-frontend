import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      data-testid="hero-section"
      className="relative h-screen overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0" style={{ y }}>
        {/* Replace this img with a <video autoPlay muted loop playsInline> for video hero */}
        <img
          src="https://i.imgur.com/bJYjsZQ.png"
          alt="TREND FORGE streetwear hero"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        style={{ opacity }}
      >
        <motion.p
          className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-brand-red mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Season 01
        </motion.p>

        <motion.h1
          className="font-heading text-5xl sm:text-6xl lg:text-[8vw] font-black tracking-tighter text-white leading-none"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          TREND FORGE
        </motion.h1>

        <motion.p
          className="mt-4 text-sm sm:text-base lg:text-lg text-white/70 font-medium uppercase tracking-[0.25em]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          FORJANDO TENDÊNCIAS
        </motion.p>

        <motion.a
          href="#collection"
          data-testid="hero-cta-button"
          className="mt-10 bg-brand-red text-white px-10 py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#0A0A0A] transition-colors duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          onClick={(e) => {
            e.preventDefault();
            document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Comprar Agora
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <motion.div
            className="w-[1px] h-12 bg-white/40"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
