import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="footer"
      className="border-t border-[var(--border-color)] px-6 md:px-12 lg:px-24 py-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-heading text-2xl font-black tracking-tighter text-[var(--text-primary)]">
            TREND FORGE
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2 uppercase tracking-[0.15em]">
            FORJANDO TENDÊNCIAS
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <a
            href="https://www.instagram.com/trendforge_ofc/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-instagram"
            className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-brand-red transition-colors flex items-center gap-1"
          >
            Instagram <ArrowUpRight size={12} />
          </a>
          
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-secondary)]">
          &copy; {year} TREND FORGE. Todos os direitos reservados.
        </p>
        
      </div>
    </footer>
  );
}
