import { useTranslation } from "react-i18next";
import { Check, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    key: "starter",
    price: "4800",
    sessions: 12,
    freezable: 2,
    popular: false,
  },
  {
    key: "pro",
    price: "16800",
    sessions: 48,
    freezable: 8,
    popular: true,
  },
  {
    key: "advanced",
    price: "9120",
    sessions: 24,
    freezable: 4,
    popular: false,
  },
];

const accentColors = {
  starter: {
    gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
    light: "#ecfeff",
    border: "#06b6d4",
    text: "#0891b2",
  },
  pro: {
    gradient: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    light: "#eff6ff",
    border: "#2563eb",
    text: "#1d4ed8",
  },
  advanced: {
    gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
    light: "#ecfeff",
    border: "#06b6d4",
    text: "#0891b2",
  },
};

export default function PricingSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-white to-slate-50">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const accent = accentColors[plan.key];
            const features = [
              t("landing.pricing.features.certificate"),
              t("landing.pricing.features.guidance"),
              t("landing.pricing.features.sessions"),
              t("landing.pricing.features.duration", {
                count: plan.sessions,
                period: t(`landing.pricing.plans.${plan.key}.period`),
              }),
              t("landing.pricing.features.freeze", {
                count: plan.freezable,
              }),
            ];

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col ${
                  plan.popular ? "md:-mt-4 md:mb-0" : ""
                }`}
                style={{
                  background: plan.popular
                    ? accent.gradient
                    : "#ffffff",
                  border: plan.popular
                    ? "none"
                    : "1.5px solid rgba(226,232,240,0.8)",
                  boxShadow: plan.popular
                    ? "0 25px 60px rgba(37,99,235,0.25)"
                    : "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="flex justify-center pt-6 pb-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xs tracking-wider uppercase shadow-md">
                      <Star size={13} className="fill-slate-900" />
                      {t("landing.pricing.popular")}
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div
                  className={`flex-1 flex flex-col p-8 ${
                    plan.popular ? "pt-4" : "pt-8"
                  }`}
                >
                  {/* Plan Name */}
                  <h3
                    className={`text-2xl font-extrabold mb-5 ${
                      plan.popular ? "text-white text-center" : ""
                    }`}
                    style={
                      !plan.popular
                        ? {
                            background: accent.gradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }
                        : undefined
                    }
                  >
                    {t(`landing.pricing.plans.${plan.key}.name`)}
                  </h3>

                  {/* Price */}
                  <div
                    className={`mb-6 ${
                      plan.popular ? "text-center" : ""
                    }`}
                  >
                    <span
                      className={`text-5xl font-black ${
                        plan.popular ? "text-white" : ""
                      }`}
                      style={
                        !plan.popular
                          ? {
                              color: "#f97316",
                            }
                          : undefined
                      }
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isRTL ? "mr-2" : "ml-2"
                      } ${
                        plan.popular
                          ? "text-blue-100"
                          : "text-slate-400"
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
                        className={`flex items-center gap-3 text-sm font-medium ${
                          plan.popular
                            ? "text-blue-50"
                            : "text-slate-600"
                        }`}
                      >
                        <div
                          className="shrink-0 w-5.5 h-5.5 rounded-full flex items-center justify-center"
                          style={{
                            background: plan.popular
                              ? "rgba(255,255,255,0.2)"
                              : accent.light,
                            width: 22,
                            height: 22,
                          }}
                        >
                          <Check
                            size={13}
                            strokeWidth={3}
                            className={
                              plan.popular
                                ? "text-white"
                                : ""
                            }
                            style={
                              !plan.popular
                                ? { color: accent.text }
                                : undefined
                            }
                          />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mt-auto">
                    <Link to="/signup" className="block">
                      <button
                        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                          plan.popular
                            ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
                            : ""
                        }`}
                        style={
                          !plan.popular
                            ? {
                                background: accent.gradient,
                                color: "#ffffff",
                                boxShadow: `0 8px 20px ${accent.border}30`,
                              }
                            : undefined
                        }
                      >
                        {t("landing.pricing.cta_subscribe")}
                        <ArrowRight
                          size={16}
                          className={isRTL ? "rotate-180" : ""}
                        />
                      </button>
                    </Link>
                    <Link to="/contact" className="block">
                      <button
                        className={`w-full rounded-2xl py-3 font-bold text-sm transition-all duration-300 ${
                          plan.popular
                            ? "border-2 border-white/30 text-white hover:bg-white/10"
                            : "border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {t("landing.pricing.cta_free")}
                      </button>
                    </Link>
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
