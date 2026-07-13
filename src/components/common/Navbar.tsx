'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { phimApi } from "@/api/phim.api";
import { Genre, Country } from "@/types/movie";

const NAV_LINKS = [
  { href: "/", label: "Trang Chủ" },
  { href: "/movies/le", label: "Phim Lẻ" },
  { href: "/movies/bo", label: "Phim Bộ" },
  { href: "/movies/hoat-hinh", label: "Hoạt Hình" },
  { href: "/movies/tv-shows", label: "TV Shows" },
  { href: "/movies/phim-chieu-rap", label: "Chiếu Rạp" },
] as const;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<"genres" | "countries" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const taxonomyLoaded = useRef(false);

  const loadTaxonomy = () => {
    if (taxonomyLoaded.current) return;
    taxonomyLoaded.current = true;
    Promise.all([phimApi.getGenres(), phimApi.getCountries()])
      .then(([genresData, countriesData]) => {
        setGenres(genresData);
        setCountries(countriesData);
      })
      .catch((error) => {
        taxonomyLoaded.current = false;
        console.error("Error fetching categories and countries for navbar:", error);
      });
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      loadTaxonomy();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Defer taxonomy until browser is idle (desktop dropdowns)
  useEffect(() => {
    const run = () => loadTaxonomy();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(run, 2000);
    return () => clearTimeout(timer);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileSection(null);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setIsMenuOpen(true);
    }
  };

  const lastSearchTime = useRef(0);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSearchTime.current < 400) return;
    lastSearchTime.current = now;

    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      closeMenu();
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000]">
      <div className="w-full flex items-center h-16 bg-bg-surface/95 backdrop-blur-md border-b border-border/80 shadow-md">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 lg:gap-6 relative">
          
          {/* Left section: Logo & desktop Search */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0 md:flex-1 md:max-w-[500px] min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden xl:block font-display text-lg font-bold tracking-tight text-text-primary">
                VJEETOS<span className="text-accent-gold ml-0.5">MEDIA</span>
              </div>
            </Link>

            {/* Search Input — tablet/desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex relative items-center flex-1 min-w-0"
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
            <Link
              href="/"
              className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                ${isActive("/") ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
            >
              Trang Chủ
            </Link>

            {/* Thể loại Dropdown */}
            <div className="relative group py-2" onMouseEnter={loadTaxonomy}>
              <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <span>Thể loại</span>
                <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute right-[-180px] top-[40px] w-[560px] bg-bg-surface border border-border rounded-md shadow-2xl p-6 hidden group-hover:block transition-all duration-300">
                {genres.length === 0 ? (
                  <div className="text-xs text-text-muted text-center py-4">Đang tải thể loại...</div>
                ) : (
                  <div className="grid grid-cols-4 gap-x-6 gap-y-3.5">
                    {genres.map((g) => (
                      <Link
                        key={g._id || g.slug}
                        href={`/movies/moi?category=${g.slug}`}
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
            <div className="relative group py-2" onMouseEnter={loadTaxonomy}>
              <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                <span>Quốc Gia</span>
                <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute right-[-100px] top-[40px] w-[400px] bg-bg-surface border border-border rounded-md shadow-2xl p-5 hidden group-hover:block transition-all duration-300">
                {countries.length === 0 ? (
                  <div className="text-xs text-text-muted text-center py-4">Đang tải quốc gia...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    {countries.map((c) => (
                      <Link
                        key={c._id || c.slug}
                        href={`/movies/moi?country=${c.slug}`}
                        className="text-sm font-medium text-text-secondary hover:text-accent-gold transition-colors block"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-semibold tracking-wide transition-colors rounded-md
                  ${isActive(link.href) ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile search + menu — search fills remaining space */}
          <div className="flex items-center lg:hidden gap-2 flex-1 md:flex-none min-w-0 justify-end">
            <form onSubmit={handleSearch} className="relative md:hidden flex flex-1 min-w-0">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-elevated border border-border/80 rounded-md py-2 pl-8 pr-3 text-text-primary text-xs w-full focus:outline-none focus:border-accent-gold placeholder:text-text-muted"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </form>
            <button
              type="button"
              onClick={toggleMenu}
              className="text-text-primary outline-none w-9 h-9 shrink-0 flex items-center justify-center bg-bg-surface rounded-lg border border-border hover:border-border-strong transition-colors"
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
        onClick={closeMenu}
      />

      <div
        className={`fixed top-0 right-0 w-[85%] max-w-[320px] h-[100dvh] bg-bg-surface z-[2001] transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] border-l border-border flex flex-col lg:hidden
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
            onClick={closeMenu}
            className="text-text-secondary hover:text-text-primary p-2 bg-bg-elevated rounded-lg border border-border"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pt-4 no-scrollbar">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide block py-2.5 border-b border-border/40 transition-colors
                  ${isActive(link.href) ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"}`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-b border-border/40">
              <button
                type="button"
                onClick={() =>
                  setOpenMobileSection((prev) => (prev === "genres" ? null : "genres"))
                }
                className="w-full flex items-center justify-between py-2.5 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <span>Thể loại</span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform duration-200 ${
                    openMobileSection === "genres" ? "rotate-180 text-accent-gold" : ""
                  }`}
                />
              </button>
              {openMobileSection === "genres" && (
                <div className="pb-3 pl-1">
                  {genres.length === 0 ? (
                    <p className="text-xs text-text-muted py-1">Đang tải thể loại...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                      {genres.map((g) => (
                        <Link
                          key={g._id || g.slug}
                          href={`/movies/moi?category=${g.slug}`}
                          className="text-xs font-medium text-text-secondary hover:text-accent-gold transition-colors"
                          onClick={closeMenu}
                        >
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-b border-border/40">
              <button
                type="button"
                onClick={() =>
                  setOpenMobileSection((prev) => (prev === "countries" ? null : "countries"))
                }
                className="w-full flex items-center justify-between py-2.5 text-sm font-semibold tracking-wide text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <span>Quốc gia</span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform duration-200 ${
                    openMobileSection === "countries" ? "rotate-180 text-accent-gold" : ""
                  }`}
                />
              </button>
              {openMobileSection === "countries" && (
                <div className="pb-3 pl-1">
                  {countries.length === 0 ? (
                    <p className="text-xs text-text-muted py-1">Đang tải quốc gia...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                      {countries.map((c) => (
                        <Link
                          key={c._id || c.slug}
                          href={`/movies/moi?country=${c.slug}`}
                          className="text-xs font-medium text-text-secondary hover:text-accent-gold transition-colors"
                          onClick={closeMenu}
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
