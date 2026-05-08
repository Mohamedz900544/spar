import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const AGE_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 6);

const content = {
  ar: {
    back: "رجوع",
    language: "English",
    title: "علّم طفلك البرمجة أونلاين مع مدرسين متخصصين",
    titleAccent: "أونلاين",
    visualLabel: "طلاب يتعلمون التقنية",
    formTitle: "احجز حصتك المجانية",
    studentName: "اسم الطالب",
    studentNameRequired: "يرجى كتابة اسم الطالب",
    studentAge: "عمر الطالب",
    studentAgeRequired: "يرجى اختيار عمر الطالب",
    email: "البريد الإلكتروني",
    emailRequired: "يرجى كتابة البريد الإلكتروني",
    emailInvalid: "يرجى كتابة بريد إلكتروني صحيح",
    phone: "رقم الهاتف",
    phonePlaceholder: "0100 123 4567",
    phoneRequired: "يرجى كتابة رقم موبايل مصري صحيح",
    chooseTime: "اختر الموعد",
    trusted: "موثوق من أكثر من 130,000 ولي أمر حول العالم",
    years: "سنة",
    benefits: [
      "من سن 6 - 17 سنة",
      "برنامج مخصص يناسب كل فئة عمرية",
      "جلسة فردية بين الطالب والمدرس فقط",
    ],
    scheduleFor: "تسجيل حصة مجانية للطالب",
    fallbackName: "أحمد",
    timezone: "المنطقة الزمنية",
    timezoneValue: "القاهرة، مصر",
    day: "اليوم",
    loadingSlots: "جاري تحميل المواعيد المتاحة...",
    slotsError: "تعذر تحميل المواعيد المتاحة. حاول مرة أخرى.",
    noSlots: "لا توجد مواعيد متاحة حاليا. حاول مرة أخرى لاحقا.",
    noDaySlots: "لا توجد مواعيد متاحة في هذا اليوم.",
    chooseSlotRequired: "يرجى اختيار موعد متاح",
    tryAgain: "إعادة المحاولة",
    device: "لدي جهاز لابتوب أو كمبيوتر مع كاميرا وميكروفون",
    deviceRequired: "يرجى تأكيد توفر جهاز مناسب قبل تأكيد الموعد",
    confirm: "تأكيد",
    booking: "جاري الحجز...",
    confirmed: "تم حجز حصتك المجانية",
    bookingFailed: "تعذر إتمام الحجز. حاول اختيار موعد آخر.",
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
    studentNameRequired: "Please enter the student name",
    studentAge: "Student age",
    studentAgeRequired: "Please choose the student's age",
    email: "Email address",
    emailRequired: "Please enter an email address",
    emailInvalid: "Please enter a valid email address",
    phone: "Phone number",
    phonePlaceholder: "0100 123 4567",
    phoneRequired: "Please enter a valid Egyptian mobile number",
    chooseTime: "Choose appointment",
    trusted: "Trusted by 130,000+ parents around the world",
    years: "years old",
    benefits: [
      "Ages 6 - 17",
      "A tailored program for every age group",
      "One-to-one session between student and teacher",
    ],
    scheduleFor: "Register a free class for",
    fallbackName: "Ahmed",
    timezone: "Time zone",
    timezoneValue: "Cairo, Egypt",
    day: "Day",
    loadingSlots: "Loading available appointments...",
    slotsError: "Could not load available appointments. Please try again.",
    noSlots: "No appointments are available right now. Please try again later.",
    noDaySlots: "No appointments are available on this day.",
    chooseSlotRequired: "Please choose an available appointment",
    tryAgain: "Try again",
    device: "I have a laptop or computer with camera and microphone",
    deviceRequired: "Please confirm that a suitable device is available before confirming",
    confirm: "Confirm",
    booking: "Booking...",
    confirmed: "Your free class has been booked",
    bookingFailed: "Could not complete the booking. Please choose another slot.",
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

const isValidEgyptPhone = (value) =>
  /^(010|011|012|015)\d{8}$/.test(`${value || ""}`.replace(/\D/g, ""));

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseLocalDateKey = (dateKey) => {
  const [year, month, day] = `${dateKey || ""}`.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const getDayInfo = (dateKey, labels) => {
  const date = parseLocalDateKey(dateKey);
  if (!date) return { weekday: "", day: "", month: "" };

  return {
    weekday: labels.weekDays[date.getUTCDay()],
    day: date.getUTCDate(),
    month: labels.monthNames[date.getUTCMonth()],
  };
};

const formatSlotTime = (localTime, lang) => {
  const [hourValue, minuteValue] = `${localTime || ""}`.split(":").map(Number);
  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) return "";

  const hour12 = hourValue % 12 || 12;
  const minute = String(minuteValue).padStart(2, "0");
  const suffix =
    lang === "ar" ? (hourValue >= 12 ? "م" : "ص") : hourValue >= 12 ? "PM" : "AM";

  return `${hour12}:${minute} ${suffix}`;
};

const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const FreeSessionBooking = () => {
  const [lang, setLang] = useState("ar");
  const [step, setStep] = useState("form");
  const [slots, setSlots] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [deviceReady, setDeviceReady] = useState(false);
  const [deviceError, setDeviceError] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const [agePickerOpen, setAgePickerOpen] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedSlotLabel, setConfirmedSlotLabel] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    studentName: "",
    studentAge: "",
    email: "",
    phone: "",
  });

  const copy = content[lang];
  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";
  const displayName = formData.studentName.trim() || copy.fallbackName;
  const slotDays = useMemo(() => {
    const grouped = new Map();

    for (const day of availableDays) {
      if (!day?.localDate) continue;
      grouped.set(day.localDate, {
        key: day.localDate,
        ...getDayInfo(day.localDate, copy),
        slots: [],
      });
    }

    for (const slot of slots) {
      if (!slot?.localDate) continue;
      if (!grouped.has(slot.localDate)) {
        grouped.set(slot.localDate, {
          key: slot.localDate,
          ...getDayInfo(slot.localDate, copy),
          slots: [],
        });
      }
      grouped.get(slot.localDate).slots.push(slot);
    }

    return Array.from(grouped.values()).sort((first, second) =>
      first.key.localeCompare(second.key)
    );
  }, [availableDays, copy, slots]);
  const selectedDay = slotDays.find((day) => day.key === selectedDayKey);
  const selectedSlot = (selectedDay?.slots || []).find(
    (slot) => slot.id === selectedSlotId
  );
  const selectedSlotLabel =
    selectedDay && selectedSlot
      ? `${selectedDay.weekday} ${selectedDay.day} ${selectedDay.month} - ${formatSlotTime(
          selectedSlot.localTime,
          lang
        )}`
      : "";

  const fetchSlots = useCallback(async () => {
    try {
      setSlotsLoading(true);
      setSlotsError("");

      const response = await fetch(
        getApiUrl("/api/sales/public/free-session/slots")
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load available slots");
      }

      setSlots(Array.isArray(data.slots) ? data.slots : []);
      setAvailableDays(Array.isArray(data.days) ? data.days : []);
    } catch (error) {
      console.error("Free session slots error:", error);
      setSlotsError(error.message || "Failed to load available slots");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = isRTL
      ? "احجز حصة برمجة مجانية | SP School"
      : "Book a Free Coding Class | SP School";
    document.documentElement.dir = direction;
    document.documentElement.lang = lang;
  }, [direction, isRTL, lang]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (!slotDays.length) {
      setSelectedDayKey("");
      setSelectedSlotId("");
      return;
    }

    const currentDay = slotDays.find((day) => day.key === selectedDayKey);
    if (!currentDay) {
      const firstDay = slotDays[0];
      setSelectedDayKey(firstDay.key);
      setSelectedSlotId(firstDay.slots[0]?.id || "");
      return;
    }

    if (!currentDay.slots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(currentDay.slots[0]?.id || "");
    }
  }, [selectedDayKey, selectedSlotId, slotDays]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChooseTime = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.studentName.trim()) {
      nextErrors.studentName = copy.studentNameRequired;
    }
    if (!formData.studentAge) {
      nextErrors.studentAge = copy.studentAgeRequired;
    }
    if (!formData.email.trim()) {
      nextErrors.email = copy.emailRequired;
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = copy.emailInvalid;
    }
    if (!isValidEgyptPhone(formData.phone)) {
      nextErrors.phone = copy.phoneRequired;
    }

    setFieldErrors(nextErrors);
    if (nextErrors.studentAge) {
      setAgeError(true);
      setAgePickerOpen(true);
    } else {
      setAgePickerOpen(false);
      setAgeError(false);
    }

    if (Object.keys(nextErrors).length) {
      return;
    }

    setStep("schedule");
    setConfirmed(false);
    setConfirmedSlotLabel("");
    setDeviceError(false);
    setSlotError(false);
    setBookingError("");
    if (!slots.length && !slotsLoading) {
      fetchSlots();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
    setAgePickerOpen(false);
    setAgeError(false);
    setConfirmed(false);
    setConfirmedSlotLabel("");
    setDeviceError(false);
    setSlotError(false);
    setBookingError("");
    setFieldErrors({});
  };

  const handleAgeSelect = (age) => {
    setFormData((prev) => ({ ...prev, studentAge: String(age) }));
    setFieldErrors((prev) => ({ ...prev, studentAge: "" }));
    setAgeError(false);
    setAgePickerOpen(false);
  };

  const handleConfirm = async () => {
    if (!deviceReady) {
      setDeviceError(true);
      setConfirmed(false);
      return;
    }
    if (!selectedSlot) {
      setSlotError(true);
      setConfirmed(false);
      return;
    }

    setDeviceError(false);
    setSlotError(false);
    setBookingError("");
    setBooking(true);

    try {
      const response = await fetch(
        getApiUrl("/api/sales/public/free-session/book"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childName: formData.studentName.trim(),
            childAge: Number(formData.studentAge),
            email: formData.email.trim(),
            phone: formData.phone,
            scheduledAt: selectedSlot.scheduledAt,
            deviceConfirmed: true,
          }),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || copy.bookingFailed);
      }

      setConfirmedSlotLabel(selectedSlotLabel);
      setConfirmed(true);
      fetchSlots();
    } catch (error) {
      console.error("Free session booking error:", error);
      setConfirmed(false);
      setBookingError(error.message || copy.bookingFailed);
      fetchSlots();
    } finally {
      setBooking(false);
    }
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
                setConfirmedSlotLabel("");
                setDeviceError(false);
                setSlotError(false);
                setBookingError("");
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
              {slotsLoading ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500">
                  {copy.loadingSlots}
                </p>
              ) : slotsError ? (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-5 text-center">
                  <p className="text-sm font-bold text-red-600">{copy.slotsError}</p>
                  <button
                    type="button"
                    onClick={fetchSlots}
                    className="mt-3 rounded-lg bg-[#102a5a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0a1a38]"
                  >
                    {copy.tryAgain}
                  </button>
                </div>
              ) : slotDays.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500">
                  {copy.noSlots}
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {slotDays.map((day) => {
                      const active = selectedDayKey === day.key;
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            setSelectedDayKey(day.key);
                            setSelectedSlotId(day.slots[0]?.id || "");
                            setConfirmed(false);
                            setConfirmedSlotLabel("");
                            setSlotError(false);
                            setBookingError("");
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

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {(selectedDay?.slots || []).map((slot) => {
                      const active = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setConfirmed(false);
                            setConfirmedSlotLabel("");
                            setSlotError(false);
                            setBookingError("");
                          }}
                          className={[
                            "min-w-[112px] rounded-lg border-2 px-5 py-3 text-sm font-black transition",
                            active
                              ? "border-[#FBBF24] bg-[#FFF9E6] text-[#102a5a] shadow-[0_8px_18px_rgba(251,191,36,0.22)]"
                              : "border-slate-200 bg-white text-slate-500 hover:border-[#FBBF24]",
                          ].join(" ")}
                        >
                          {formatSlotTime(slot.localTime, lang)}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDay && selectedDay.slots.length === 0 && (
                    <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-bold text-slate-500">
                      {copy.noDaySlots}
                    </p>
                  )}
                </>
              )}
            </div>

            {slotError && (
              <p className="mt-2 text-center text-xs font-bold text-red-500">
                {copy.chooseSlotRequired}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                const nextDeviceReady = !deviceReady;
                setDeviceReady(nextDeviceReady);
                if (nextDeviceReady) setDeviceError(false);
                setConfirmed(false);
                setConfirmedSlotLabel("");
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
              disabled={booking || confirmed || slotsLoading || !slotDays.length}
              className="mt-5 w-full rounded-lg bg-[#102a5a] px-5 py-3.5 text-center text-lg font-black text-white shadow-[0_14px_28px_rgba(16,42,90,0.24)] transition hover:bg-[#0a1a38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {booking ? copy.booking : copy.confirm}
            </button>

            {bookingError && (
              <p className="mt-3 text-center text-sm font-bold text-red-500">
                {bookingError || copy.bookingFailed}
              </p>
            )}

            {confirmed && (
              <p className="mt-4 text-center text-sm font-bold text-[#102a5a]">
                {copy.confirmed}: {confirmedSlotLabel || selectedSlotLabel}
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
                  aria-invalid={Boolean(fieldErrors.studentName)}
                  aria-describedby={fieldErrors.studentName ? "student-name-error" : undefined}
                  className={`h-12 w-full rounded-lg border-2 bg-white text-start text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#FBBF24] ${
                    fieldErrors.studentName ? "border-red-400" : "border-slate-200"
                  } ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                />
              </label>
              {fieldErrors.studentName && (
                <p id="student-name-error" className="-mt-3 text-start text-xs font-bold text-red-500">
                  {fieldErrors.studentName}
                </p>
              )}

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
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "student-email-error" : undefined}
                  className={`h-12 w-full rounded-lg border-2 bg-white text-start text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#FBBF24] ${
                    fieldErrors.email ? "border-red-400" : "border-slate-200"
                  } ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                />
              </label>
              {fieldErrors.email && (
                <p id="student-email-error" className="-mt-3 text-start text-xs font-bold text-red-500">
                  {fieldErrors.email}
                </p>
              )}

              <div dir="ltr">
                <EgyptPhoneInput
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData((prev) => ({ ...prev, phone }));
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  error={fieldErrors.phone}
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
