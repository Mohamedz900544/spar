import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import { scratchSessions } from "./scratchSessions";

const copy = {
  ar: {
    home: "الرئيسية",
    courses: "المسارات",
    login: "تسجيل الدخول",
    breadcrumbHome: "الرئيسية",
    breadcrumbCategory: "المناهج",
    title: "منهج سكراتش",
    meta: "12 جلسة",
    mode: "أونلاين 1:1 خاص",
    summary:
      "رحلة عملية للأطفال لتعلم البرمجة بالبلوكات من خلال الأنيميشن، القصص، والألعاب البسيطة.",
    paragraph1:
      "هذا المنهج مصمم للمتعلمين الصغار الذين يبدأون البرمجة لأول مرة بطريقة ممتعة ومنظمة.",
    paragraph2:
      "سيتعلم الطفل واجهة Scratch، تحريك الشخصيات، استخدام الأصوات، بناء الألعاب، وفهم أساسيات المنطق والتسلسل.",
    details: "تفاصيل المنهج",
    detailTitle: "منهج سكراتش: 12 جلسة",
    session: "الجلسة",
  },
  en: {
    home: "HOME",
    courses: "COURSES",
    login: "LOGIN",
    breadcrumbHome: "HOME",
    breadcrumbCategory: "CURRICULUM",
    title: "Scratch Curriculum",
    meta: "12 Sessions",
    mode: "Online 1:1 Private",
    summary:
      "A hands-on journey for kids into animation, storytelling, and beginner-friendly game creation.",
    paragraph1:
      "This curriculum is designed for young learners who are starting coding for the first time in a fun, structured way.",
    paragraph2:
      "Students learn the Scratch interface, character movement, sounds, game actions, and core ideas like logic and sequencing.",
    details: "CURRICULUM DETAILS",
    detailTitle: "Scratch Curriculum: 12 Sessions",
    session: "Session",
  },
};

export default function ScratchCurriculum() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const text = isArabic ? copy.ar : copy.en;
  const textDirection = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    document.title = "Scratch Curriculum — SP School";
  }, []);

  return (
    <div
      className="min-h-screen bg-white font-sans text-slate-800"
      dir={textDirection}
    >
      <Navbar />

      <main className="px-4 pb-16 pt-28 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <section className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] md:items-start">
            <div className="overflow-hidden rounded-[1.6rem] bg-slate-900 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
              <div className="relative aspect-square min-h-[320px]">
                <img
                  src="https://i.ibb.co/xSg1Jtq5/Chat-GPT-Image-May-8-2026-06-44-09-PM.webp"
                  alt={text.title}
                  className="h-full w-full object-cover opacity-85 blur-[1px] scale-105"
                />
                 
                {/* <div className="absolute inset-x-0 bottom-0 px-7 pb-10 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FBBF24]/20 text-6xl font-black text-[#FBBF24] shadow-[0_0_45px_rgba(251,191,36,0.55)]">
                    S
                  </div>
                  <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
                    {isArabic ? "منهج" : "Scratch"}
                    <br />
                    {isArabic ? "سكراتش" : "Curriculum"}
                  </h2>
                </div> */}
              </div>
            </div>

            <div className="pt-2 text-start">
              <div className="mb-3 text-xs font-medium uppercase text-slate-500">
                <Link to="/" className="hover:text-[#FBBF24]">
                  {text.breadcrumbHome}
                </Link>
                <span className="mx-2">/</span>
                <Link to="/courses" className="hover:text-[#FBBF24]">
                  {text.breadcrumbCategory}
                </Link>
              </div>

              <h1 className="mb-3 max-w-md text-3xl font-extrabold leading-tight text-[#102a5a] md:text-4xl">
                {text.title}
              </h1>

              <div className="mb-5 text-2xl font-black text-[#071228]">
                {text.meta}
              </div>

              <p className="mb-7 text-base font-extrabold text-[#102a5a]">
                {text.mode}
              </p>

              <div className="max-w-lg space-y-5 text-base font-bold leading-8 text-slate-700">
                <p>{text.summary}</p>
                <p>{text.paragraph1}</p>
                <p>{text.paragraph2}</p>
              </div>
            </div>
          </section>

          <section
            className={`mt-12 border-t border-slate-200 pt-0 ${
              isArabic ? "text-right" : "text-left"
            }`}
            dir={textDirection}
          >
            <div
              className={`mb-8 inline-block border-t-4 border-[#FBBF24] pt-3 text-xs font-black uppercase text-[#102a5a] ${
                isArabic ? "mr-0 ml-auto" : "ml-0 mr-auto"
              }`}
            >
              {text.details}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#102a5a] md:text-3xl">
                {text.detailTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2" dir={textDirection}>
              {scratchSessions.map((session) => (
                <article
                  key={session.session}
                  className={`border-b border-slate-200 py-5 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                  dir={textDirection}
                >
                  <p className="mb-2 text-sm font-black text-[#2dd4bf]" dir={textDirection}>
                    <span>{text.session}</span>
                    <span className={isArabic ? "mr-1" : "ml-1"}>
                      {session.session}
                    </span>
                  </p>
                  <h3 className="mb-2 text-lg font-extrabold text-[#102a5a]">
                    {session.topic[isArabic ? "ar" : "en"]}
                  </h3>
                  <p className="text-sm font-semibold leading-7 text-slate-500">
                    {session.mainIdea[isArabic ? "ar" : "en"]}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
