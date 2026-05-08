import { useTranslation } from "react-i18next";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    key: "oneToOne",
    price: "3500",
    originalPrice: "5500",
    features: [
      "subscription",
      "totalSessions",
      "sessionLength",
      "courseSessions",
    ],
  },
  {
    key: "oneMonthPrivate",
    price: "1500",
    originalPrice: "2200",
    features: [
      "subscriptionOneMonth",
      "totalSessionsOneMonth",
      "sessionLength",
      "courseSessionsOneMonth",
    ],
  },
];

const accentColors = {
  oneToOne: {
    gradient: "linear-gradient(135deg, #ca8a04, #fde047)",
    softGradient: "linear-gradient(180deg, #fefce8 0%, #ffffff 58%)",
    light: "#fef08a",
    border: "#eab308",
    text: "#854d0e",
    price: "#ca8a04",
  },
  oneMonthPrivate: {
    gradient: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
    softGradient: "linear-gradient(180deg, #eff6ff 0%, #ffffff 58%)",
    light: "#dbeafe",
    border: "#2563eb",
    text: "#1d4ed8",
    price: "#1d4ed8",
  },
};

export default function PricingSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section id="pricing" className="py-16 md:py-24 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-4xl font-display"
            style={{
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("landing.pricing.title")}
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-base mt-4 max-w-xl mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-4xl mx-auto">
          {plans.map((plan) => {
            const accent = accentColors[plan.key];
            const features = [
              t(`landing.pricing.plans.${plan.key}.sessionType`),
              ...plan.features
                .filter(Boolean)
                .map((feature) => t(`landing.pricing.features.${feature}`)),
            ];

            return (
              <div
                key={plan.key}
                className="group relative rounded-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                style={{
                  background: accent.softGradient,
                  border: `1.5px solid ${accent.border}55`,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-2"
                  style={{ background: accent.gradient }}
                />

                {/* Card Content */}
                <div
                  className="flex-1 flex flex-col p-8 pt-10"
                >
                  {/* Plan Name */}
                  <h3
                    className="text-2xl font-extrabold mb-5 text-center text-slate-950"
                  >
                    {t(`landing.pricing.plans.${plan.key}.name`)}
                  </h3>

                  {/* Price */}
                  <div
                    className="mb-6 text-center"
                  >
                    <div
                      className="mb-2 text-sm font-bold text-slate-400 line-through"
                    >
                      {plan.originalPrice} {t("landing.pricing.currency")}
                    </div>
                    <span
                      className="text-5xl font-black"
                      style={{ color: accent.price }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm font-bold text-slate-500 ${
                        isRTL ? "mr-2" : "ml-2"
                      }`}
                    >
                      / {t(`landing.pricing.plans.${plan.key}.period`)}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 mb-8 flex-1">
                    {features.map((feature, i) => (
                      <li
                        key={i}
                        dir={isRTL ? "rtl" : "ltr"}
                        className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                      >
                        <div
                          className="shrink-0 w-5.5 h-5.5 rounded-md flex items-center justify-center"
                          style={{
                            background: accent.light,
                            width: 22,
                            height: 22,
                          }}
                        >
                          <Check
                            size={13}
                            strokeWidth={3}
                            style={{ color: accent.text }}
                          />
                        </div>
                        <span
                          dir={isRTL ? "rtl" : "ltr"}
                          className={isRTL ? "text-right" : "text-left"}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mt-auto">
                    <a
                      href={`https://web.whatsapp.com/send?phone=201500077369&text=${encodeURIComponent(
                        t("landing.pricing.wa_subscribe", {
                          plan: t(`landing.pricing.plans.${plan.key}.name`),
                          price: plan.price,
                          period: t(`landing.pricing.plans.${plan.key}.period`),
                        })
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <button
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-bold text-sm text-white transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                          background: accent.gradient,
                          boxShadow: `0 8px 20px ${accent.border}35`,
                        }}
                      >
                        {t("landing.pricing.cta_subscribe")}
                        <ArrowRight
                          size={16}
                          className={isRTL ? "rotate-180" : ""}
                        />
                      </button>
                    </a>
                    <a
                      href={`https://web.whatsapp.com/send?phone=201500077369&text=${encodeURIComponent(
                        t("landing.pricing.wa_free")
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <button
                        className="w-full rounded-lg border-2 py-3 font-bold text-sm transition-all duration-300 hover:bg-white"
                        style={{
                          borderColor: `${accent.border}55`,
                          color: accent.text,
                        }}
                      >
                        {t("landing.pricing.cta_free")}
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
