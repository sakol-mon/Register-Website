"use client";

import { motion } from "framer-motion";
import { Loader2, Menu, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Attendee = {
  id: string;
  full_name: string;
  topics: string;
};

const navLinks = ["Home", "About", "Speakers", "Schedule", "Registration", "รายชื่อผู้เข้าอบรม", "Contact"];

function navHref(item: string): string {
  if (item === "Home") {
    return "/";
  }

  if (item === "Registration") {
    return "/registration";
  }

  if (item === "รายชื่อผู้เข้าอบรม") {
    return "/attendees";
  }

  return `/#${item.toLowerCase()}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "ไม่สามารถโหลดรายชื่อผู้เข้าอบรมได้";
}

function formatTopicLabel(topicName: string): string {
  if (topicName.includes("AI for Research")) {
    return "Prism";
  }

  if (topicName === "Data Analysis") {
    return "Data Analysis with AI";
  }

  if (topicName === "Scopus AI") {
    return "Scopus AI & Consensus & Elicit";
  }

  return topicName;
}

function getTopicSortKey(topicName: string): string {
  if (topicName === "Scopus AI & Consensus & Elicit") {
    return "Scopus AI";
  }

  if (topicName === "Data Analysis with AI") {
    return "Data Analysis";
  }

  return topicName;
}

export default function AttendeesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [topicAccessHint, setTopicAccessHint] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAttendees() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const supabase = getSupabaseBrowserClient();
        const registrationsPromise = supabase.from("registrations").select("id, full_name, organization, role").order("full_name", { ascending: true });
        const registrationTopicsPromise = supabase.from("registration_topics").select("registration_id, workshop_id");
        const workshopsPromise = supabase.from("workshops").select("id, code, topic_name, title");

        const [
          { data: registrations, error: registrationsError },
          { data: registrationTopics, error: registrationTopicsError },
          { data: workshops, error: workshopsError },
        ] = await Promise.all([registrationsPromise, registrationTopicsPromise, workshopsPromise]);

        if (registrationsError) {
          throw registrationsError;
        }

        if (registrationTopicsError) {
          throw registrationTopicsError;
        }

        if (workshopsError) {
          throw workshopsError;
        }

        if (!isActive) {
          return;
        }

        setTopicAccessHint((registrations?.length ?? 0) > 0 && (registrationTopics?.length ?? 0) === 0);

        const workshopById = new Map(
          (workshops ?? []).map((workshop) => [
            workshop.id,
            {
              label: formatTopicLabel(workshop.topic_name || workshop.title || workshop.code),
              sortKey: getTopicSortKey(workshop.topic_name || workshop.title || workshop.code),
            },
          ]),
        );

        const topicIdsByRegistration = new Map<string, string[]>();
        for (const row of registrationTopics ?? []) {
          const current = topicIdsByRegistration.get(row.registration_id) ?? [];
          topicIdsByRegistration.set(row.registration_id, [...current, row.workshop_id]);
        }

        const rows = (registrations ?? []).map((registration) => ({
          id: registration.id,
          full_name: registration.full_name,
          topics:
            (topicIdsByRegistration.get(registration.id) ?? [])
              .map((workshopId) => workshopById.get(workshopId))
              .filter((topic): topic is { label: string; sortKey: string } => Boolean(topic))
              .sort((left, right) => left.sortKey.localeCompare(right.sortKey, "th"))
              .map((topic) => topic.label)
              .join(", ") || "ยังไม่มีหัวข้อที่สมัคร",
        }));

        setAttendees(rows as Attendee[]);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAttendees([]);
        setTopicAccessHint(false);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAttendees();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredAttendees = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return attendees;
    }

    return attendees.filter((attendee) => {
      const haystack = [attendee.full_name, attendee.topics].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [attendees, searchText]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "bg-[#061B4D]/65 backdrop-blur-xl border-b border-white/10" : "bg-transparent",
        ].join(" ")}
      >
        <div className="section-shell flex h-20 items-center justify-between">
          <Link href="/" className="focus-ring rounded-full px-3 py-2 text-sm font-semibold tracking-[0.2em] text-white" aria-label="Go to home page">
            LIBRARY AI LAB
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {navLinks.map((item) => (
              <Link
                key={item}
                className="focus-ring rounded-full px-2 py-1 text-sm text-zinc-200 transition hover:text-[#56A6FF]"
                href={navHref(item)}
              >
                {item}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="section-shell pb-5 md:hidden">
            <div className="glass-card p-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item}
                    href={navHref(item)}
                    className="focus-ring rounded-xl px-4 py-2 text-sm text-zinc-100 hover:bg-white/8"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-28">
        <div className="bg-wave" aria-hidden="true" />
        <section className="section-shell pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="glass-card mx-auto max-w-6xl p-6 sm:p-10"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm tracking-[0.2em] text-[#56A6FF]">ATTENDEES LIST</p>
                <h1 className="mt-2 font-(family-name:--font-poppins) text-3xl font-bold text-white sm:text-4xl">รายชื่อผู้เข้าอบรม</h1>
                <p className="mt-3 text-zinc-300">แสดงรายชื่อผู้สมัครและหัวข้อที่สมัครจาก Supabase ในตารางเดียว</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Total</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{attendees.length.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Visible</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{filteredAttendees.length.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-zinc-200 focus-within:border-[#56A6FF]/50">
                <Search className="size-5 shrink-0 text-[#56A6FF]" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-400"
                  placeholder="ค้นหาชื่อหรือหัวข้อที่สมัคร"
                />
              </label>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-[#43D5FF]/50 hover:text-[#56A6FF]"
              >
                <RefreshCw size={16} />
                รีเฟรชข้อมูล
              </button>
            </div>

            <div className="mt-8">
              {topicAccessHint && !errorMessage && (
                <div className="mb-4 rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  พบรายชื่อผู้สมัคร แต่ยังไม่พบความสัมพันธ์หัวข้อในผลลัพธ์ที่อ่านได้ของตาราง registration_topics
                  โปรดรันไฟล์ SQL ใน supabase/registration_read_public.sql เพื่อเปิดสิทธิ์อ่านสำหรับหน้าแสดงผลนี้
                </div>
              )}

              {isLoading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3 text-zinc-200">
                    <Loader2 className="size-5 animate-spin text-[#56A6FF]" />
                    กำลังโหลดรายชื่อจาก Supabase...
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
                  <p className="font-semibold">เกิดข้อผิดพลาด</p>
                  <p className="mt-2 text-sm leading-relaxed">{errorMessage}</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 text-center">
                  {searchText.trim() ? (
                    <>
                      <h2 className="mt-4 text-xl font-semibold text-white">ยังไม่มีข้อมูลที่ตรงกับคำค้น</h2>
                      <p className="mt-2 max-w-xl text-sm text-zinc-300">
                        ลองเปลี่ยนคำค้น หรือเคลียร์คำค้นเพื่อดูรายชื่อทั้งหมด
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-4 text-xl font-semibold text-white">ยังไม่มีข้อมูลผู้เข้าอบรมในระบบ</h2>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-[0_18px_60px_rgba(1,9,34,0.35)]">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-white/8 text-sm text-zinc-300">
                      <tr>
                        <th className="px-6 py-4 font-semibold">ชื่อ</th>
                        <th className="px-6 py-4 font-semibold">หัวข้อที่สมัคร</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendees.map((attendee, index) => (
                        <motion.tr
                          key={attendee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
                          className="border-t border-white/10 text-white hover:bg-white/5"
                        >
                          <td className="px-6 py-4 align-top font-medium">{attendee.full_name}</td>
                          <td className="px-6 py-4 align-top text-zinc-200">{attendee.topics}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}