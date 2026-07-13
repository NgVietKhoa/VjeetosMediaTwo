'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { phimApi } from "@/api/phim.api";
import { Genre, Country } from "@/types/movie";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Load categories and countries dynamically from API
  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const [genresData, countriesData] = await Promise.all([
          phimApi.getGenres(),
          phimApi.getCountries()
        ]);
        setGenres(genresData);
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching categories and countries for navbar:", error);
      }
    };
    fetchNavbarData();
  }, []);

  const lastSearchTime = useRef(0);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSearchTime.current < 400) return;
    lastSearchTime.current = now;

    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000]">
      <div className="w-full flex items-center h-16 bg-bg-surface/95 backdrop-blur-md border-b border-border/80 shadow-md">
        <div className="max-w-[1450px] mx-auto px-6 flex items-center w-full justify-between gap-6 relative">
          
          {/* Left section: Logo & Search Box */}
          <div className="flex items-center gap-6 flex-1 max-w-[500px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-11 h-11 object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden xl:block font-display text-lg font-bold tracking-tight text-text-primary">
                VJEETOS<span className="text-accent-gold ml-0.5">MEDIA</span>
              </div>
            </Link>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex relative items-center flex-1"
            >
              <input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-elevated border border-border/60 rounded-md py-2 pl-10 pr-4 text-text-primary text-sm w-full focus:border-accent-gold focus:outline-none transition-all placeholder:text-text-muted"
              />
              <Search
                size={16}
                className="absolute left-3.5 text-text-muted"
              />
            </form>
          </div>

          {/* Right section: Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {/* Trang chủ */}
            <Link
              href="/"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Trang Chủ
            </Link>

            {/* Thể loại Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <span>Thể loại</span>
                <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Large Grid Dropdown Panel */}
              <div className="absolute right-[-180px] top-[40px] w-[560px] bg-bg-surface border border-border rounded-md shadow-2xl p-6 hidden group-hover:block transition-all duration-300">
                {genres.length === 0 ? (
                  <div className="text-xs text-text-muted text-center py-4">Đang tải thể loại...</div>
                ) : (
                  <div className="grid grid-cols-4 gap-x-6 gap-y-3.5">
                    {genres.map((g) => (
                      <Link
                        key={g._id || g.slug}
                        href={`/phim/moi?category=${g.slug}`}
                        className="text-sm font-medium text-text-secondary hover:text-accent-gold transition-colors block"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quốc gia Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <span>Quốc Gia</span>
                <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Grid Dropdown Panel */}
              <div className="absolute right-[-100px] top-[40px] w-[400px] bg-bg-surface border border-border rounded-md shadow-2xl p-5 hidden group-hover:block transition-all duration-300">
                {countries.length === 0 ? (
                  <div className="text-xs text-text-muted text-center py-4">Đang tải quốc gia...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    {countries.map((c) => (
                      <Link
                        key={c._id || c.slug}
                        href={`/phim/moi?country=${c.slug}`}
                        className="text-sm font-medium text-text-secondary hover:text-accent-gold transition-colors block"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Phim lẻ */}
            <Link
              href="/phim/le"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/phim/le" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Phim Lẻ
            </Link>

            {/* Phim bộ */}
            <Link
              href="/phim/bo"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/phim/bo" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Phim Bộ
            </Link>

            {/* Hoạt hình */}
            <Link
              href="/phim/hoat-hinh"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/phim/hoat-hinh" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Hoạt Hình
            </Link>

            {/* TV Shows */}
            <Link
              href="/phim/tv-shows"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/phim/tv-shows" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              TV Shows
            </Link>

            {/* Phim chiếu rạp */}
            <Link
              href="/phim/phim-chieu-rap"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${pathname === "/phim/phim-chieu-rap" ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Chiếu Rạp
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center lg:hidden gap-3">
            <form onSubmit={handleSearch} className="relative md:hidden flex max-w-[150px]">
              <input
                type="text"
                placeholder="Tìm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-elevated border border-border/80 rounded-md py-1.5 pl-8 pr-2.5 text-text-primary text-xs w-full focus:outline-none placeholder:text-text-muted"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </form>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-primary outline-none w-9 h-9 flex items-center justify-center bg-bg-surface rounded-lg border border-border hover:border-border-strong transition-colors"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-[2000] transition-opacity duration-300 lg:hidden
          ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 w-[85%] max-w-[300px] h-[100dvh] bg-bg-surface z-[2001] transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] border-l border-border flex flex-col lg:hidden
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 bg-bg-surface p-5 pb-4 z-10 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div className="font-display font-bold text-base text-text-primary tracking-tight">
              VJEETOS<span className="text-accent-gold ml-0.5">MEDIA</span>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-text-secondary hover:text-text-primary p-2 bg-bg-elevated rounded-lg border border-border"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pt-4 no-scrollbar">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary block py-1.5 border-b border-border/40"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            <Link
              href="/phim/le"
              className="text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary block py-1.5 border-b border-border/40"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim Lẻ
            </Link>
            <Link
              href="/phim/bo"
              className="text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary block py-1.5 border-b border-border/40"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim Bộ
            </Link>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Thể loại</span>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {genres.slice(0, 12).map((g) => (
                  <Link
                    key={g._id || g.slug}
                    href={`/phim/moi?category=${g.slug}`}
                    className="text-xs font-medium text-text-secondary hover:text-accent-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
