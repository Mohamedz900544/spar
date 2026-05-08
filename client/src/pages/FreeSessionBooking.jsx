import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  Mail,
  User,
} from "lucide-react";
import EgyptPhoneInput from "../components/EgyptPhoneInput";

const HERO_IMAGE_URL =
  "https://res.cloudinary.com/dipzvlfnt/image/upload/f_auto,q_auto,w_900/v1772832876/Robot_l1b0pg.webp";

const AGE_OPTIONS = Array.from({ length: 13 }, (_, index) => index + 6);

const content = {
  ar: {
    back: "رجوع",
    language: "English",
    title: "علّم طفلك البرمجة أونلاين مع مدرسين متخصصين",
    titleAccent: "أونلاين",
    visualLabel: "طلاب يتعلمون التقنية",
    formTitle: "احجز حصتك المجانية",
    studentName: "اسم الطالب",
    studentAge: "عمر الطالب",
    studentAgeRequired: "يرجى اختيار عمر الطالب",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    phonePlaceholder: "0100 123 4567",
    chooseTime: "اختر الموعد",
    trusted: "موثوق من أكثر من 130,000 ولي أمر حول العالم",
    years: "سنة",
    benefits: [
      "من سن 6 - 18 سنة",
      "برنامج مخصص يناسب كل فئة عمرية",
      "جلسة فردية بين الطالب والمدرس فقط",
    ],
    scheduleFor: "تسجيل حصة مجانية للطالب",
    fallbackName: "أحمد",
    timezone: "المنطقة الزمنية",
    timezoneValue: "القاهرة، مصر",
    day: "اليوم",
    device: "لدي جهاز لابتوب أو كمبيوتر مع كاميرا وميكروفون",
    deviceRequired: "يرجى تأكيد توفر جهاز مناسب قبل تأكيد الموعد",
    confirm: "تأكيد",
    confirmed: "تم اختيار الموعد مؤقتا",
    monthNames: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    weekDays: [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ],
  },
  en: {
    back: "Back",
    language: "العربية",
    title: "Teach your child coding online with specialized instructors",
    titleAccent: "online",
    visualLabel: "Students learning technology",
    formTitle: "Book your free class",
    studentName: "Student name",
    studentAge: "Student age",
    studentAgeRequired: "Please choose the student's age",
    email: "Email address",
    phone: "Phone number",
    phonePlaceholder: "0100 123 4567",
    chooseTime: "Choose appointment",
    trusted: "Trusted by 130,000+ parents around the world",
    years: "years old",
    benefits: [
      "Ages 6 - 18",
      "A tailored program for every age group",
      "One-to-one session between student and teacher",
    ],
    scheduleFor: "Register a free class for",
    fallbackName: "Ahmed",
    timezone: "Time zone",
    timezoneValue: "Cairo, Egypt",
    day: "Day",
    device: "I have a laptop or computer with camera and microphone",
    deviceRequired: "Please confirm that a suitable device is available before confirming",
    confirm: "Confirm",
    confirmed: "Appointment selected for now",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    weekDays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
};

const makeDays = (lang) => {
  const labels = content[lang];
  const today = new Date();

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      id: date.toISOString(),
      weekday: labels.weekDays[date.getDay()],
      day: date.getDate(),
      month: labels.monthNames[date.getMonth()],
    };
  });
};

const formatTime = (time, lang) => (lang === "ar" ? `PM ${time}` : `${time} PM`);

const FreeSessionBooking = () => {
  const [lang, setLang] = useState("ar");
  const [step, setStep] = useState("form");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("9:00");
  const [deviceReady, setDeviceReady] = useState(false);
  const [deviceError, setDeviceError] = useState(false);
  const [agePickerOpen, setAgePickerOpen] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    studentAge: "",
    email: "",
    phone: "",
  });

  const copy = content[lang];
  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";
  const days = useMemo(() => makeDays(lang), [lang]);
  const displayName = formData.studentName.trim() || copy.fallbackName;

  useEffect(() => {
    document.title = isRTL
      ? "احجز حصة برمجة مجانية | SP School"
      : "Book a Free Coding Class | SP School";
    document.documentElement.dir = direction;
    document.documentElement.lang = lang;
  }, [direction, isRTL, lang]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChooseTime = (event) => {
    event.preventDefault();
    if (!formData.studentAge) {
      setAgeError(true);
      setAgePickerOpen(true);
      return;
    }

    setAgePickerOpen(false);
    setAgeError(false);
    setStep("schedule");
    setConfirmed(false);
    setDeviceError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
    setAgePickerOpen(false);
    setAgeError(false);
    setConfirmed(false);
    setDeviceError(false);
  };

  const handleAgeSelect = (age) => {
    setFormData((prev) => ({ ...prev, studentAge: String(age) }));
    setAgeError(false);
    setAgePickerOpen(false);
  };

  const handleConfirm = () => {
    if (!deviceReady) {
      setDeviceError(true);
      setConfirmed(false);
      return;
    }

    setDeviceError(false);
    setConfirmed(true);
  };

  if (step === "schedule") {
    return (
      <div className="min-h-screen bg-white text-[#102a5a]" dir={direction}>
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6" dir="ltr">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setConfirmed(false);
                setDeviceError(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg p-0 text-sm font-bold text-[#102a5a] transition hover:text-[#FBBF24]"
            >
              <ArrowLeft size={18} />
              <span>{copy.back}</span>
            </button>
            <Link to="/" className="inline-flex">
              <img src="/logo.png" alt="SP School" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 rounded-lg p-0 text-sm font-bold text-[#102a5a] transition hover:text-[#FBBF24]"
          >
            <Globe2 size={17} />
            <span>{copy.language}</span>
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-5xl justify-center px-4 pb-10">
          <section className="w-full max-w-3xl rounded-lg border border-[#e8edf5] bg-white px-5 py-9 shadow-[0_24px_70px_rgba(16,42,90,0.12)] sm:px-8 md:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">{copy.scheduleFor}</p>
              <h1 className="mt-2 text-4xl font-black text-[#102a5a]">{displayName}</h1>

              <div className="relative mx-auto mt-7 flex h-28 w-28 items-center justify-center rounded-lg bg-[#102a5a] text-white shadow-[0_16px_34px_rgba(16,42,90,0.26)]">
                <CalendarDays size={58} strokeWidth={2.2} />
                <span className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-white text-[#FBBF24] shadow-lg">
                  <Clock3 size={25} />
                </span>
              </div>
            </div>

            <div className="mt-10">
              <label className="mb-3 block text-start text-base font-extrabold text-slate-700">
                {copy.timezone}
              </label>
              <input
                readOnly
                value={copy.timezoneValue}
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-start text-sm font-semibold text-slate-400 outline-none"
              />
            </div>

            <div className="mt-8">
              <p className="mb-4 text-start text-base font-extrabold text-slate-700">{copy.day}</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {days.map((day, index) => {
                  const active = selectedDay === index;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setSelectedDay(index);
                        setConfirmed(false);
                      }}
                      className={[
                        "flex h-28 w-[90px] flex-col items-center justify-center rounded-lg border-2 px-3 py-3 text-center transition",
                        active
                          ? "border-[#FBBF24] bg-[#FFF9E6] text-[#102a5a] shadow-[0_8px_18px_rgba(251,191,36,0.22)]"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#FBBF24]",
                      ].join(" ")}
                    >
                      <span className="text-sm font-bold">{day.weekday}</span>
                      <span className="mt-1 text-3xl font-black leading-none">{day.day}</span>
                      <span className="mt-2 text-xs font-bold">{day.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["9:00", "8:00", "7:00"].map((time) => {
                const active = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setConfirmed(false);
                    }}
                    className={[
                      "min-w-[112px] rounded-lg border-2 px-5 py-3 text-sm font-black transition",
                      active
                        ? "border-[#FBBF24] bg-[#FFF9E6] text-[#102a5a] shadow-[0_8px_18px_rgba(251,191,36,0.22)]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-[#FBBF24]",
                    ].join(" ")}
                  >
                    {formatTime(time, lang)}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const nextDeviceReady = !deviceReady;
                setDeviceReady(nextDeviceReady);
                if (nextDeviceReady) setDeviceError(false);
                setConfirmed(false);
              }}
              className={[
                "mt-6 flex w-full items-center justify-between rounded-lg border bg-[#FFF9E6] px-4 py-4 text-start text-sm font-extrabold text-[#102a5a] transition hover:border-[#FBBF24]",
                deviceError ? "border-red-400" : "border-[#FBBF24]",
              ].join(" ")}
              aria-pressed={deviceReady}
              aria-describedby={deviceError ? "device-required-error" : undefined}
            >
              <span>{copy.device}</span>
              <span
                className={[
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  deviceReady ? "border-[#FBBF24] bg-[#FBBF24]" : "border-[#FBBF24] bg-white",
                ].join(" ")}
              >
                {deviceReady && <Check size={11} className="text-[#102a5a]" />}
              </span>
            </button>

            {deviceError && (
              <p id="device-required-error" className="mt-2 text-start text-xs font-bold text-red-500">
                {copy.deviceRequired}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="mt-5 w-full rounded-lg bg-[#102a5a] px-5 py-3.5 text-center text-lg font-black text-white shadow-[0_14px_28px_rgba(16,42,90,0.24)] transition hover:bg-[#0a1a38]"
            >
              {copy.confirm}
            </button>

            {confirmed && (
              <p className="mt-4 text-center text-sm font-bold text-[#102a5a]">
                {copy.confirmed}: {days[selectedDay].weekday} {days[selectedDay].day}{" "}
                {days[selectedDay].month} - {formatTime(selectedTime, lang)}
              </p>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#102a5a]" dir={direction}>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8" dir="ltr">
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-2 rounded-lg p-0 text-sm font-bold text-[#102a5a] transition hover:text-[#FBBF24]"
        >
          <Globe2 size={17} />
          <span>{copy.language}</span>
        </button>
        <Link to="/" className="inline-flex">
          <img src="/logo.png" alt="SP School" className="h-9 w-auto object-contain md:h-11" />
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-10 pt-2 md:px-8 lg:grid-cols-[minmax(360px,450px)_1fr] lg:gap-14" dir="ltr">
        <section className="order-2 w-full lg:order-1" dir={direction}>
          <form
            onSubmit={handleChooseTime}
            className="mx-auto w-full max-w-[450px] rounded-lg border border-[#e8edf5] bg-white px-6 py-8 shadow-[0_20px_56px_rgba(16,42,90,0.08)] sm:px-8"
          >
            <h2 className="mb-7 text-center text-xl font-black text-[#172554]">
              {copy.formTitle}
            </h2>

            <div className="space-y-5">
              <label className="relative block">
                <User
                  className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isRTL ? "right-4" : "left-4"}`}
                />
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder={copy.studentName}
                  className={`h-12 w-full rounded-lg border-2 border-slate-200 bg-white text-start text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#FBBF24] ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                />
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAgePickerOpen((prev) => !prev)}
                  className={[
                    "flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border-2 bg-white px-4 py-3 text-start outline-none transition",
                    ageError
                      ? "border-red-400"
                      : agePickerOpen
                        ? "border-[#FBBF24]"
                        : "border-slate-200 hover:border-[#FBBF24]",
                  ].join(" ")}
                  aria-expanded={agePickerOpen}
                  aria-controls="student-age-options"
                  aria-describedby={ageError ? "student-age-error" : undefined}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-bold text-slate-400">{copy.studentAge}</span>
                    <span
                      className={`text-sm font-black ${
                        formData.studentAge ? "text-[#102a5a]" : "text-slate-500"
                      }`}
                    >
                      {formData.studentAge
                        ? `${formData.studentAge} ${copy.years}`
                        : copy.studentAge}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      agePickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {agePickerOpen && (
                  <div
                    id="student-age-options"
                    className="mt-2 rounded-lg border border-[#e8edf5] bg-[#fffdf7] p-2 shadow-[0_14px_34px_rgba(16,42,90,0.12)]"
                  >
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {AGE_OPTIONS.map((age) => {
                        const active = formData.studentAge === String(age);

                        return (
                          <button
                            key={age}
                            type="button"
                            onClick={() => handleAgeSelect(age)}
                            className={[
                              "flex h-11 items-center justify-center rounded-lg border text-sm font-black transition",
                              active
                                ? "border-[#FBBF24] bg-[#FBBF24] text-[#102a5a] shadow-[0_8px_18px_rgba(251,191,36,0.24)]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-[#FBBF24] hover:text-[#102a5a]",
                            ].join(" ")}
                          >
                            {age}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {ageError && (
                  <p id="student-age-error" className="mt-2 text-start text-xs font-bold text-red-500">
                    {copy.studentAgeRequired}
                  </p>
                )}
              </div>

              <label className="relative block">
                <Mail
                  className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isRTL ? "right-4" : "left-4"}`}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={copy.email}
                  className={`h-12 w-full rounded-lg border-2 border-slate-200 bg-white text-start text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#FBBF24] ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                />
              </label>

              <div dir="ltr">
                <EgyptPhoneInput
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                  name="phone"
                  placeholder={copy.phonePlaceholder}
                  aria-label={copy.phone}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-[22px] bg-[#102a5a] px-5 py-3.5 text-base font-black text-white shadow-[0_14px_30px_rgba(16,42,90,0.22)] transition hover:bg-[#0a1a38]"
            >
              {copy.chooseTime}
            </button>

             
          </form>
        </section>

        <section className="order-1 min-w-0 text-center lg:order-2 lg:text-start" dir={direction}>
          <h1 className="mx-auto max-w-3xl text-3xl font-black leading-tight text-[#102a5a] md:text-4xl lg:mx-0">
            {isRTL ? (
              <>
                علّم طفلك البرمجة <span className="text-[#FBBF24]">{copy.titleAccent}</span>{" "}
                مع مدرسين متخصصين
              </>
            ) : (
              copy.title
            )}
          </h1>
          <p className="mt-3 text-sm font-bold text-[#102a5a]/70">{copy.visualLabel}</p>

          <div className="mx-auto mt-6 max-w-[560px] overflow-hidden rounded-lg lg:mx-0">
            <img
              src={HERO_IMAGE_URL}
              alt={copy.visualLabel}
              className="h-auto w-full object-cover"
            />
          </div>

          <div
            className={`mx-auto mt-8 max-w-xl space-y-5 ${
              isRTL ? "lg:mr-0 lg:ml-auto" : "lg:mx-0"
            }`}
          >
            {copy.benefits.map((benefit) => (
              <div
                key={benefit}
                className={`flex items-center gap-4 ${
                  isRTL ? "justify-start text-right" : "justify-center lg:justify-start"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-transparent text-[#FBBF24]">
                  <Check size={20} strokeWidth={3} />
                </span>
                <span className="text-base font-extrabold text-[#172554]">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FreeSessionBooking;
