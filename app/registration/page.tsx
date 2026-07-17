"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

const workshopOptions = [
  { id: "NotebookLM", title: "ครั้งที่ 1", topic: "NotebookLM", date: "19 สิงหาคม พ.ศ. 2569" },
  { id: "Claude", title: "ครั้งที่ 2", topic: "Claude", date: "2 กันยายน พ.ศ. 2569" },
  { id: "Gemini", title: "ครั้งที่ 3", topic: "Gemini", date: "16 กันยายน พ.ศ. 2569" },
  { id: "AI for Research", title: "ครั้งที่ 4", topic: "Prism", date: "30 กันยายน พ.ศ. 2569" },
  { id: "Antigravity 2.0", title: "ครั้งที่ 5", topic: "Antigravity 2.0", date: "14 ตุลาคม พ.ศ. 2569" },
  { id: "n8n", title: "ครั้งที่ 6", topic: "n8n", date: "28 ตุลาคม พ.ศ. 2569" },
  { id: "Scopus AI", title: "ครั้งที่ 7", topic: "Scopus AI & Consensus & Elicit", date: "11 พฤศจิกายน พ.ศ. 2569" },
  { id: "Data Analysis", title: "ครั้งที่ 8", topic: "Data Analysis with AI", date: "25 พฤศจิกายน พ.ศ. 2569" },
];

const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  return "Unable to submit registration";
}

export default function RegistrationPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");

  const organizationRequired = selectedRole === "student" || selectedRole === "staff";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const organization = String(formData.get("organization") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const selectedTopicCodes = formData
      .getAll("topics")
      .map((value) => String(value).trim())
      .filter((value) => value.length > 0);

    if (!strictEmailRegex.test(email)) {
      setSubmitted(false);
      setSubmitError("รูปแบบอีเมลไม่ถูกต้อง ต้องเป็นรูปแบบ name@example.com");
      return;
    }

    if ((role === "student" || role === "staff") && !organization) {
      setSubmitted(false);
      setSubmitError("กรุณาระบุหน่วยงาน/คณะสำหรับนักศึกษาและบุคลากร");
      return;
    }

    if (selectedTopicCodes.length === 0) {
      setSubmitted(false);
      setSubmitError("กรุณาเลือกหัวข้อที่สนใจอย่างน้อย 1 รายการ");
      return;
    }

    if (selectedTopicCodes.length > 2) {
      setSubmitted(false);
      setSubmitError("เลือกหัวข้อที่สนใจได้ไม่เกิน 2 รายการ");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSubmitted(false);
      setSubmitError("ระบบยังไม่พร้อมใช้งาน: ยังไม่ได้ตั้งค่า Supabase Environment Variables");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const registrationId = crypto.randomUUID();

      const { error: registrationError } = await supabase
        .from("registrations")
        .insert({
          id: registrationId,
          full_name: fullName,
          email,
          phone,
          organization,
          role,
        });

      if (registrationError) {
        throw registrationError;
      }

      if (selectedTopicCodes.length > 0) {
        const { data: workshops, error: workshopsError } = await supabase
          .from("workshops")
          .select("id, code")
          .in("code", selectedTopicCodes);

        if (workshopsError) {
          throw workshopsError;
        }

        if (!workshops || workshops.length !== selectedTopicCodes.length) {
          throw new Error("Selected workshop topics are not available in database");
        }

        const topicRows = workshops.map((workshop) => ({
          registration_id: registrationId,
          workshop_id: workshop.id,
        }));

        const { error: topicInsertError } = await supabase.from("registration_topics").insert(topicRows);
        if (topicInsertError) {
          throw topicInsertError;
        }
      }

      setPreviewName(fullName);
      setSubmitted(true);
      setSelectedTopics([]);
      setSelectedRole("");
      formElement.reset();
    } catch (error) {
      setSubmitted(false);
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopicToggle = (topicId: string, checked: boolean, input: HTMLInputElement) => {
    setSelectedTopics((prev) => {
      if (checked) {
        if (prev.includes(topicId)) {
          return prev;
        }

        if (prev.length >= 2) {
          input.checked = false;
          return prev;
        }

        return [...prev, topicId];
      }

      return prev.filter((item) => item !== topicId);
    });
  };

  return (
    <div className="relative">
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "bg-[#061B4D]/65 backdrop-blur-xl border-b border-white/10" : "bg-transparent",
        ].join(" ")}
      >
        <div className="section-shell flex h-20 items-center justify-between">
          <Link href="/" className="focus-ring rounded-full px-3 py-2 text-sm font-semibold tracking-[0.2em] text-white" aria-label="Go to home section">
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

      <main className="relative min-h-screen overflow-hidden py-24 pt-28">
        <div className="bg-wave" aria-hidden="true" />
        <section className="section-shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-card mx-auto max-w-4xl p-6 sm:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm tracking-[0.2em] text-[#56A6FF]">REGISTRATION FORM</p>
              <h1 className="mt-2 font-(family-name:--font-poppins) text-3xl font-bold text-white sm:text-4xl">แบบฟอร์มรับสมัคร LIBRARY AI LAB</h1>
              <p className="mt-3 max-w-2xl text-zinc-300">กรอกข้อมูลเพื่อแสดงความประสงค์เข้าร่วมกิจกรรม ข้อมูลจะถูกบันทึกลงระบบเมื่อส่งแบบฟอร์มสำเร็จ</p>
            </div>
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-zinc-100 transition hover:border-[#43D5FF]/50 hover:text-[#56A6FF]"
            >
              กลับหน้าแรก
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-100">ชื่อ-นามสกุล</span>
                <input
                  name="fullName"
                  required
                  className="focus-ring rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-zinc-100 placeholder:text-zinc-400"
                  placeholder="เช่น นายสมชาย ใจดี"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-100">อีเมล</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                  title="กรุณาใส่อีเมลที่ถูกต้อง (เช่น name@example.com)"
                  className="focus-ring rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-zinc-100 placeholder:text-zinc-400"
                  placeholder="name@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-100">หมายเลขโทรศัพท์</span>
                <input
                  name="phone"
                  required
                  type="tel"
                  pattern="(02[0-9]{7}|0[3457][0-9]{7}|0[689][0-9]{8})( ?(ต่อ|ext\.?|#) ?[0-9]+)?"
                  title="กรุณาใส่เบอร์โทรที่ถูกต้อง: บ้าน (02xxxxxxx) หรือ (03X-07Xxxxxxxx) หรือมือถือ (06X/08X/09Xxxxxxxxx) เช่น 0812345678"
                  className="focus-ring rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-zinc-100 placeholder:text-zinc-400"
                  placeholder="08xxxxxxxx"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-100">
                  หน่วยงาน/คณะ {organizationRequired ? <span className="text-[#56A6FF]">*</span> : null}
                </span>
                <input
                  name="organization"
                  required={organizationRequired}
                  className="focus-ring rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-zinc-100 placeholder:text-zinc-400"
                  placeholder="ระบุหน่วยงานหรือคณะ"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-100">สถานะผู้สมัคร</span>
              <select
                name="role"
                required
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="focus-ring rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-zinc-100"
              >
                <option value="" disabled className="text-black">
                  เลือกสถานะ
                </option>
                <option value="student" className="text-black">
                  นักศึกษามหาวิทยาลัยมหิดล
                </option>
                <option value="staff" className="text-black">
                  บุคลากรมหาวิทยาลัยมหิดล
                </option>
                <option value="school-network" className="text-black">
                  ครู/นักเรียน เครือข่ายความร่วมมือ
                </option>
                <option value="general" className="text-black">
                  บุคคลทั่วไป/ผู้สนใจ
                </option>
              </select>
            </label>

            <fieldset className="rounded-2xl border border-white/20 bg-white/8 p-4">
              <legend className="px-2 text-sm font-semibold text-zinc-100">หัวข้อที่สนใจ (เลือกได้ไม่เกิน 2 รายการ)</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {workshopOptions.map((workshop) => (
                  <label key={workshop.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/8 cursor-pointer">
                    <input
                      type="checkbox"
                      name="topics"
                      value={workshop.id}
                      onChange={(event) => handleTopicToggle(workshop.id, event.target.checked, event.currentTarget)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#43D5FF]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#56A6FF]">{workshop.title}</p>
                      <p className="text-sm font-medium text-zinc-100">{workshop.topic}</p>
                      <p className="text-xs text-zinc-400">📅 {workshop.date}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs text-zinc-400">เลือกแล้ว {selectedTopics.length}/2 รายการ</p>
            </fieldset>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="focus-ring inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2F7CFF] to-[#43D5FF] px-7 py-3 font-semibold text-white shadow-[0_0_30px_rgba(67,213,255,0.5)] transition hover:scale-105 hover:shadow-[0_0_38px_rgba(67,213,255,0.65)]"
              >
                {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลสมัคร"}
              </button>
              <p className="text-xs text-zinc-400">สถานะตอนนี้: เชื่อมต่อ Supabase แล้ว ข้อมูลจะถูกบันทึกเมื่อส่งแบบฟอร์มสำเร็จ</p>
            </div>

            {submitError && <p className="text-sm text-red-300">เกิดข้อผิดพลาด: {submitError}</p>}
          </form>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 rounded-2xl border border-[#43D5FF]/30 bg-[#43D5FF]/10 p-4 text-[#D4E6FF]"
            >
              รับข้อมูลแบบฟอร์มเรียบร้อยแล้ว{previewName ? `: ${previewName}` : ""} (โหมดจำลอง)
            </motion.div>
          )}
        </motion.div>
        </section>
      </main>
    </div>
  );
}
