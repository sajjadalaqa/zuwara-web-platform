"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Check, ChevronDown, ChevronRight, Globe, LayoutGrid, LogOut, Plus, User, X,
} from "lucide-react";
import { navGroups, allItems, bottomKeys } from "./nav";
import type { DashboardUser } from "./user";
import s from "./dashboard.module.css";

const LOGO = "/brand/zuwara-logo.png";

function Avatar({ user, className }: { user: DashboardUser; className: string }) {
  return (
    <span className={className}>
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt={user.name} />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export default function DashboardShell({
  user,
  bell,
  children,
}: {
  user: DashboardUser;
  bell: React.ReactNode; // server-rendered <NotificationBell /> passed from layout.tsx
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const prefix = isAr ? "/ar" : "";
  const [sheet, setSheet] = useState(false);
  const lang = useDropdown();
  const account = useDropdown();

  const rel = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const isActive = (h: string) =>
    h === "/dashboard" ? rel === "/dashboard" : rel.startsWith(h);

  const label = (i: { en: string; ar: string }) => (isAr ? i.ar : i.en);
  const href = (h: string) => `${prefix}${h}`;
  const bottom = bottomKeys.map((k) => allItems.find((i) => i.key === k)!);
  const enHref = rel;
  const arHref = `/ar${rel}`;
  const langHref = isAr ? enHref : arHref;
  const badgeFor = (key: string) => (key === "messages" ? user.unreadMessages : 0);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  useEffect(() => { setSheet(false); }, [pathname]);

  const handleLogout = () => {
    // TODO (backend): await signOut(); router.push("/login-page");
  };

  const Tab = ({ i }: { i: (typeof bottom)[number] }) => {
    const Icon = i.icon;
    return (
      <Link href={href(i.href)} className={`${s.tab} ${isActive(i.href) ? s.tabActive : ""}`}>
        <Icon size={21} />
        <span>{label(i)}</span>
      </Link>
    );
  };

  return (
    <div className={s.shell}>
      {/* ===== Header ===== */}
      <header className={s.header}>
        <Link href={href("/")} className={s.logo} aria-label="Zuwara">
          <Image src={LOGO} alt="Zuwara" width={130} height={42} priority />
        </Link>

        <div className={s.headerRight}>
          {/* Notification bell with dropdown (server-rendered, passed from layout) */}
          {bell}

          {/* Language dropdown */}
          <div className={`${s.dropWrap} ${s.hideMobile}`} ref={lang.ref}>
            <button
              type="button"
              className={s.pill}
              onClick={() => lang.setOpen((o) => !o)}
              aria-expanded={lang.open}
            >
              <Globe size={17} />
              <span>{isAr ? "العربية" : "English"}</span>
              <ChevronDown size={15} className={lang.open ? s.flip : ""} />
            </button>
            {lang.open && (
              <div className={s.menu}>
                <Link href={enHref} className={s.menuItem} onClick={() => lang.setOpen(false)}>
                  <span>English</span>
                  {!isAr && <Check size={16} />}
                </Link>
                <Link href={arHref} className={s.menuItem} onClick={() => lang.setOpen(false)}>
                  <span>العربية</span>
                  {isAr && <Check size={16} />}
                </Link>
              </div>
            )}
          </div>

          {/* Account dropdown */}
          <div className={s.dropWrap} ref={account.ref}>
            <button
              type="button"
              className={s.userChip}
              onClick={() => account.setOpen((o) => !o)}
              aria-expanded={account.open}
            >
              <Avatar user={user} className={s.avatar} />
              <span className={s.userText}>
                <b>{user.name}</b>
                <small>{user.email}</small>
              </span>
              <ChevronDown size={16} className={`${s.userChev} ${account.open ? s.flip : ""}`} />
            </button>
            {account.open && (
              <div className={s.menu}>
                <Link href={href("/dashboard/profile")} className={s.menuItem} onClick={() => account.setOpen(false)}>
                  <span className={s.menuLabel}><User size={16} />{isAr ? "ملفي الشخصي" : "My Profile"}</span>
                </Link>
                <Link href={href("/dashboard/notifications")} className={s.menuItem} onClick={() => account.setOpen(false)}>
                  <span className={s.menuLabel}><Bell size={16} />{isAr ? "الإشعارات" : "Notifications"}</span>
                </Link>
                <button type="button" className={`${s.menuItem} ${s.menuDanger}`} onClick={handleLogout}>
                  <span className={s.menuLabel}><LogOut size={16} />{isAr ? "تسجيل الخروج" : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== Desktop sidebar ===== */}
      <aside className={s.sidebar}>
        <Link href={href("/dashboard/profile")} className={s.sideProfile}>
          <Avatar user={user} className={s.sideAvatar} />
          <span className={s.sideProfileText}>
            <b>{user.name}</b>
            <small>{user.email}</small>
          </span>
          <ChevronRight size={18} className={s.sideChev} />
        </Link>

        <nav className={s.nav}>
          {navGroups.map((g) => (
            <div key={g.en} className={s.group}>
              <p className={s.groupTitle}>{label(g)}</p>
              {g.items.map((i) => {
                const Icon = i.icon;
                const n = badgeFor(i.key);
                return (
                  <Link
                    key={i.key}
                    href={href(i.href)}
                    className={`${s.link} ${isActive(i.href) ? s.active : ""}`}
                  >
                    <Icon size={19} />
                    <span>{label(i)}</span>
                    {n > 0 && <span className={s.navBadge}>{n}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <button className={s.logout} type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
        </button>
      </aside>

      {/* ===== Content ===== */}
      <div className={s.main}>
        <div className={s.content}>{children}</div>
      </div>

      {/* ===== Mobile bottom nav ===== */}
      <nav className={s.bottomNav} aria-label="Primary">
        <Tab i={bottom[0]} />
        <Tab i={bottom[1]} />
        <Link href={href("/provider")} className={s.bookBtn} aria-label={isAr ? "احجز" : "Book"}>
          <Plus size={26} />
        </Link>
        <Tab i={bottom[2]} />
        <button className={s.tab} onClick={() => setSheet(true)} type="button">
          <LayoutGrid size={21} />
          <span>{isAr ? "المزيد" : "More"}</span>
        </button>
      </nav>

      {/* ===== Mobile "More" sheet ===== */}
      {sheet && <div className={s.overlay} onClick={() => setSheet(false)} />}
      <div className={`${s.sheet} ${sheet ? s.sheetOpen : ""}`} role="dialog" aria-hidden={!sheet}>
        <div className={s.grab} />
        <div className={s.sheetTop}>
          <span className={s.sheetTitle}>{isAr ? "القائمة" : "Menu"}</span>
          <button className={s.iconBtn} onClick={() => setSheet(false)} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={s.sheetBody}>
          <Link href={href("/dashboard/profile")} className={s.profileCard}>
            <Avatar user={user} className={s.profileAvatar} />
            <span className={s.profileText}>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </span>
            <ChevronRight size={20} className={s.chevWhite} />
          </Link>

          {navGroups.map((g) => (
            <section key={g.en}>
              <p className={s.groupTitle}>{label(g)}</p>
              <div className={s.list}>
                {g.items.map((i) => {
                  const Icon = i.icon;
                  const n = badgeFor(i.key);
                  return (
                    <Link
                      key={i.key}
                      href={href(i.href)}
                      className={`${s.row} ${isActive(i.href) ? s.rowActive : ""}`}
                    >
                      <span className={s.rowIcon}><Icon size={20} /></span>
                      <span className={s.rowLabel}>{label(i)}</span>
                      {n > 0 && <span className={s.navBadge}>{n}</span>}
                      <ChevronRight size={18} className={s.chev} />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          <section>
            <p className={s.groupTitle}>{isAr ? "التفضيلات" : "Preferences"}</p>
            <div className={s.list}>
              <Link href={langHref} className={s.row}>
                <span className={s.rowIcon}><Globe size={20} /></span>
                <span className={s.rowLabel}>{isAr ? "English" : "العربية"}</span>
                <ChevronRight size={18} className={s.chev} />
              </Link>
              <button className={`${s.row} ${s.rowDanger}`} type="button" onClick={handleLogout}>
                <span className={s.rowIcon}><LogOut size={20} /></span>
                <span className={s.rowLabel}>{isAr ? "تسجيل الخروج" : "Logout"}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}