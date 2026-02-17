// src/pages/blocks/BlocksHome.jsx
import { Link } from "react-router-dom";
import {
  LayoutPanelTop,
  Palette,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

const lessons = [
  {
    id: 1,
    title: "Build Your First Page",
    description: "Kids add a title, short text and a cute button.",
    tag: "Level 1",
  },
  {
    id: 2,
    title: "Play with Colors & Layout",
    description: "Change colors, backgrounds and organise elements.",
    tag: "Level 2",
  },
  {
    id: 3,
    title: "Buttons & Simple Actions",
    description: "Make buttons that feel alive on hover and click.",
    tag: "Level 3",
  },
];

export default function BlocksHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-28">
        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 mb-4">
              <Sparkles className="w-4 h-4" />
              Brand new · Kids Frontend Lab
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Let kids design{" "}
              <span className="text-sky-600">web pages with blocks</span> 🧱
            </h1>
            <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
              No scary code. Kids drag colourful blocks to build a real web
              page, then see the code that powers it. Perfect for curious
              minds who love to create.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/blocks/play"
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-700 transition"
              >
                Start playground
                <MousePointerClick className="w-4 h-4 ms-2" />
              </Link>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="h-9 w-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 text-lg">
                  🙂
                </div>
                <p className="max-w-[180px] leading-snug">
                  Designed for ages 7–11.
                  <br />
                  Safe, simple and playful.
                </p>
              </div>
            </div>
          </div>

          {/* Cute preview card */}
          <div className="relative">
            <div className="rounded-3xl bg-white shadow-xl shadow-sky-100 border border-sky-50 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <LayoutPanelTop className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Kids Page Builder
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Drag · Drop · Play
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  Live preview
                </span>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 p-3 mb-3">
                <div className="h-3 w-16 rounded-full bg-sky-200 mb-3" />
                <div className="space-y-2 mb-3">
                  <div className="h-6 w-40 rounded-xl bg-white/80" />
                  <div className="h-3 w-32 rounded-full bg-white/60" />
                  <div className="h-3 w-24 rounded-full bg-white/40" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 flex-1 rounded-xl bg-white/80" />
                  <div className="h-9 flex-1 rounded-xl bg-sky-200/80" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="rounded-xl border border-dashed border-sky-200 p-2 text-center text-slate-500">
                  Heading
                </div>
                <div className="rounded-xl border border-dashed border-amber-200 p-2 text-center text-slate-500">
                  Paragraph
                </div>
                <div className="rounded-xl border border-dashed border-emerald-200 p-2 text-center text-slate-500">
                  Button
                </div>
              </div>
            </div>

            <div className="absolute -left-3 -bottom-3 h-16 w-16 rounded-3xl bg-amber-200/60 blur-xl" />
            <div className="absolute -right-4 -top-4 h-14 w-14 rounded-3xl bg-sky-200/60 blur-xl" />
          </div>
        </div>

        {/* Lesson cards */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">
              What will kids learn?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex mb-3 text-[10px] px-2 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold">
                    {lesson.tag}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    {lesson.description}
                  </p>
                </div>
                <div className="pt-4 text-[11px] text-slate-400">
                  Short activity + free play time.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bar */}
        <div className="mt-8 rounded-3xl bg-sky-600 text-white px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-sky-200">
          <div className="text-sm md:text-base font-semibold">
            Ready for your child to build their first website?
          </div>
          <div className="flex gap-3">
            <Link
              to="/blocks/play"
              className="rounded-2xl bg-white/95 text-sky-700 text-xs md:text-sm px-4 py-2 font-semibold hover:bg-white transition"
            >
              Open the playground
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
