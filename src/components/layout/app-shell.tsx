"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, GraduationCap, MessagesSquare, Files, ListTodo, CalendarDays, Users, ClipboardCheck, ChartNoAxesCombined, Activity, Building2, DoorOpen, BookOpenCheck } from "lucide-react";
import { logoutAction } from "@/actions/auth";

const navigation = {
  MAHASISWA: [["", "Ringkasan", LayoutDashboard], ["/tugas-akhir", "Tugas akhir", GraduationCap], ["/bimbingan", "Bimbingan", MessagesSquare], ["/dokumen", "Dokumen", Files], ["/workspace", "Workspace", ListTodo], ["/agenda", "Agenda", CalendarDays]],
  DOSEN: [["", "Ringkasan", LayoutDashboard], ["/tugas-akhir", "Mahasiswa bimbingan", GraduationCap], ["/bimbingan", "Review bimbingan", ClipboardCheck], ["/jadwal", "Jadwal saya", CalendarDays]],
  KOORDINATOR: [["", "Ringkasan", LayoutDashboard], ["/tugas-akhir", "Tugas akhir", BookOpenCheck], ["/jadwal", "Jadwal ujian", CalendarDays], ["/monitoring", "Monitoring", Activity], ["/analytics", "Analytics", ChartNoAxesCombined]],
  ADMIN: [["", "Ringkasan sistem", LayoutDashboard], ["/pengguna", "Pengguna", Users], ["/prodi", "Program studi", Building2], ["/ruangan", "Ruangan", DoorOpen]],
} as const;
const roles = { MAHASISWA: "Mahasiswa", DOSEN: "Dosen", KOORDINATOR: "Koordinator", ADMIN: "Admin" };

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function AppShell({ role, nama, email, children }: { role: keyof typeof navigation; nama: string | null; email: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const base = `/${role.toLowerCase()}`;
  const displayName = nama?.trim() || email;
  const initials = getInitials(displayName);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const sidebar = <>
    <Link className="brand" href={base} onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden="true">T<span>↗</span></span><span>ThesisTrack<small>FTMM · UNIVERSITAS AIRLANGGA</small></span></Link>
    <p className="nav-eyebrow">{roles[role]}</p>
    <nav aria-label={`Navigasi ${roles[role]}`}>{navigation[role].map(([suffix, label, Icon], index) => {
      const href = base + suffix;
      const active = suffix ? path.startsWith(href) : path === href;
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><span className="nav-icon"><Icon size={17} strokeWidth={1.8}/></span><span><small className="nav-number">0{index + 1}</small>{label}</span></Link>;
    })}</nav>
    <div className="sidebar-foot"><div className="sidebar-account"><span className="avatar">{initials}</span><span>{displayName}<small>{roles[role]}</small></span></div><form action={logoutAction}><button type="submit"><LogOut size={16} /> Keluar</button></form></div>
  </>;
  return <div className="app-shell" data-role={role}><a href="#main-content" className="skip-link">Lewati ke konten</a><aside className="desktop-sidebar">{sidebar}</aside>
    <dialog ref={dialog} className="mobile-drawer" onCancel={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}><button type="button" className="drawer-close" aria-label="Tutup navigasi" onClick={() => setOpen(false)}><X size={22}/></button>{sidebar}</dialog>
    <div className="app-canvas"><header className="app-topbar"><div className="flex items-center gap-3"><button type="button" className="mobile-menu" aria-label="Buka navigasi" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22}/></button><span className="topbar-context">{role === "ADMIN" ? "SISTEM / ADMINISTRASI" : "AKADEMIK / TUGAS AKHIR"}</span></div><div className="user-label"><span className="avatar">{initials}</span><span>{displayName}<small>{roles[role]}</small></span></div></header><div id="main-content" className="app-content" tabIndex={-1}>{children}</div><footer className="app-footer"><span>ThesisTrack</span><span>FTMM · Universitas Airlangga</span></footer></div>
  </div>;
}
