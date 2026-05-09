import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import { dataAiSessions } from "./dataAiSessions";

const HERO_IMAGE_URL = "https://i.ibb.co/H6zN2Wb/846545.webp";

const copy = {
  ar: {
    breadcrumbHome: "الرئيسية",
    breadcrumbCategory: "المناهج",
    title: "منهج تحليل البيانات والذكاء الاصطناعي",
    meta: "12 جلسة",
    mode: "أونلاين 1:1 خاص",
    summary:
      "رحلة عملية يتعلم فيها الطالب كيف تتحول البيانات إلى قرارات وأنماط وتوقعات باستخدام Python ومبادئ الذكاء الاصطناعي.",
    paragraph1:
      "هذا المنهج يساعد الطلاب الأكبر سنا على فهم البيانات وتنظيفها وتصويرها واكتشاف الأنماط بطريقة منظمة.",
    paragraph2:
      "سيتعلم الطالب Google Colab وCSV والرسوم البيانية والإحصاء البسيط وتعلم الآلة والتصنيف والتنبؤ وأخلاقيات الذكاء الاصطناعي.",
    details: "تفاصيل المنهج",
    detailTitle: "منهج تحليل البيانات والذكاء الاصطناعي: 12 جلسة",
    session: "الجلسة",
    projectFocus: "مشروع الجلسة",
    mainSkills: "المهارات الأساسية",
  },
  en: {
    breadcrumbHome: "HOME",
    breadcrumbCategory: "CURRICULUM",
    title: "Data Analysis & AI Curriculum",
    meta: "12 Sessions",
    mode: "Online 1:1 Private",
    summary:
      "A practical journey where students learn how data becomes decisions, patterns, and predictions through Python and core AI ideas.",
    paragraph1:
      "This curriculum helps older students understand how to clean, visualize, compare, and analyze data in a structured way.",
    paragraph2:
      "Students learn Google Colab, CSV files, charts, simple statistics, machine learning, classification, prediction, and responsible AI use.",
    details: "CURRICULUM DETAILS",
    detailTitle: "Data Analysis & AI Curriculum: 12 Sessions",
    session: "Session",
    projectFocus: "Project Focus",
    mainSkills: "Main Skills",
  },
};

export default function DataAICurriculum() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const text = isArabic ? copy.ar : copy.en;
  const textDirection = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    document.title = "Data Analysis & AI Curriculum - SP School";
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
                  src={HERO_IMAGE_URL}
                  alt={text.title}
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071228]/60 via-transparent to-transparent" />
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
              {dataAiSessions.map((session) => (
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
                  <h3 className="mb-3 text-lg font-extrabold text-[#102a5a]">
                    {session.topic[isArabic ? "ar" : "en"]}
                  </h3>
                  <div className="space-y-3 text-sm font-semibold leading-7 text-slate-500">
                    <p>
                      <span className="font-black text-[#102a5a]">
                        {text.projectFocus}:{" "}
                      </span>
                      {session.projectFocus[isArabic ? "ar" : "en"]}
                    </p>
                    <p>
                      <span className="font-black text-[#102a5a]">
                        {text.mainSkills}:{" "}
                      </span>
                      {session.mainSkills[isArabic ? "ar" : "en"]}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
