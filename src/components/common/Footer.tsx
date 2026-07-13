import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-[5] bg-bg-surface border-t border-border py-14 pb-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-wrap justify-between gap-12">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            <div className="font-display text-xl font-bold text-text-primary tracking-tight">
              VJEETOS<span className="text-accent-gold ml-1">MEDIA</span>
            </div>
          </div>
          <p className="text-text-secondary text-sm max-w-[400px] leading-relaxed">
            Xem phim online chất lượng cao, cập nhật liên tục các bộ phim mới nhất, hỗ trợ nhiều server xem phim ổn định và nhanh chóng.
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-2.5 min-w-[120px]">
            <h3 className="text-sm font-semibold mb-1 text-text-primary uppercase tracking-wide">
              Khám phá
            </h3>
            <Link
              href="/phim/bo"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Phim bộ
            </Link>
            <Link
              href="/phim/le"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Phim lẻ
            </Link>
            <Link
              href="/phim/tv-shows"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              TV Shows
            </Link>
            <Link
              href="/phim/hoat-hinh"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Hoạt hình
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 min-w-[120px]">
            <h3 className="text-sm font-semibold mb-1 text-text-primary uppercase tracking-wide">
              Hỗ trợ
            </h3>
            <Link
              href="#"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Điều khoản
            </Link>
            <Link
              href="#"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Bảo mật
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 min-w-[120px]">
            <h3 className="text-sm font-semibold mb-1 text-text-primary uppercase tracking-wide">
              Liên hệ
            </h3>
            <a
              href="mailto:khoa2006nguyen811@gmail.com"
              className="flex items-center gap-2.5 text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              <Mail size={18} className="text-text-muted" />
              <span>khoa2006nguyen811@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 mt-14 pt-6 border-t border-border flex flex-wrap justify-between items-center text-text-muted text-xs gap-4">
        <p>
          &copy; {new Date().getFullYear()} Vjeetos Media
        </p>
        <p>
          Phát triển bởi{" "}
          <a href="#" className="text-accent-gold font-medium hover:opacity-80 transition-opacity">
            VjeetKoa
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
