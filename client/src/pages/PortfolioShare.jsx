import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Blocks,
  ChevronDown,
  ExternalLink,
  Loader2,
  Sparkles,
  Star,
  Smile
} from "lucide-react";

import BlockPreview from "../components/blocks/BlockPreview";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const EMPTY_BUILDER = { rootSectionIds: [], sections: {}, blocks: {} };

const getSafeBuilder = (builder) => ({
  rootSectionIds: Array.isArray(builder?.rootSectionIds) ? builder.rootSectionIds : [],
  sections: builder?.sections || {},
  blocks: builder?.blocks || {},
});

const getInitial = (name) => (name || "S").trim().charAt(0).toUpperCase();

const getDefaultPortfolioAbout = (name, age) =>
  `Hi! I'm ${name || "Student"}. I am ${age || "-"} years old and this is my digital scrapbook of projects made at SP School.`;

const resolveAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
};

const getScratchThumbnail = (project) =>
  project.thumbnailUrl ||
  (project.projectId ? `https://uploads.scratch.mit.edu/get_image/project/${project.projectId}_480x360.png` : "");

const ProfileAvatar = ({ name, photoUrl }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedPhotoUrl = resolveAssetUrl(photoUrl);
  const showPhoto = resolvedPhotoUrl && !imageFailed;

  return (
    <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-4xl font-black text-blue-700 shadow-sm ring-1 ring-blue-100 transition-transform hover:scale-[1.03] sm:h-28 sm:w-28 sm:text-5xl">
      {showPhoto ? (
        <img
          src={resolvedPhotoUrl}
          alt={name || "Portfolio profile"}
          onError={() => setImageFailed(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        getInitial(name)
      )}
     
    </div>
  );
};

const ProjectFlag = ({ type, label }) => {
  const isScratch = type === "scratch";
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-sm border-2 ${
        isScratch 
          ? "border-violet-100 bg-violet-50 text-violet-700" 
          : "border-blue-100 bg-blue-50 text-blue-700"
      }`}
    >
      {isScratch ? <Sparkles className="h-3.5 w-3.5" /> : <Blocks className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
};

const ScratchCover = ({ project }) => (
  <div className="h-36 overflow-hidden bg-violet-50 sm:h-40">
    {getScratchThumbnail(project) ? (
      <img
        src={getScratchThumbnail(project)}
        alt={project.title || "Scratch project"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
    ) : (
      <div className="flex h-full items-center justify-center bg-violet-50 text-violet-600">
        <Sparkles className="h-12 w-12" />
      </div>
    )}
  </div>
);

const BlocksCover = ({ project }) => (
  <div className="h-36 overflow-hidden bg-blue-50 sm:h-40">
    <div className="pointer-events-none origin-top-left scale-[0.25] transition-transform duration-500 group-hover:scale-[0.27] sm:scale-[0.34] sm:group-hover:scale-[0.36]">
      <div className="w-[1024px] bg-white p-3">
        <BlockPreview
          builder={getSafeBuilder(project.builder || EMPTY_BUILDER)}
          selection={null}
          dragItem={null}
          setDragItem={() => {}}
          zoom={1}
          frame={false}
          allowQuickInsert={false}
        />
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project }) => {
  const isScratch = project.type === "scratch";
  const projectUrl = isScratch
    ? project.url || `https://scratch.mit.edu/projects/${project.projectId}`
    : project.sharePath || `/blocks/share/${project.id}`;
  const buttonTone = isScratch
    ? "bg-violet-600 text-white hover:bg-violet-700"
    : "bg-blue-600 text-white hover:bg-blue-700";
  const borderTone = isScratch ? "border-violet-100" : "border-blue-100";
  const bodyTone = isScratch
    ? "bg-gradient-to-br from-white to-violet-50"
    : "bg-gradient-to-br from-white to-blue-50";

  return (
    <article className={`group flex h-full min-h-[400px] flex-col overflow-hidden rounded-xl border ${borderTone} bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}>
      <div className="relative overflow-hidden">
        {isScratch ? <ScratchCover project={project} /> : <BlocksCover project={project} />}
        <div className="absolute top-4 right-4 z-10">
          <ProjectFlag type={project.type} label={project.sourceLabel || (isScratch ? "Scratch" : "Blocks Play")} />
        </div>
      </div>

      <div className={`relative z-20 flex flex-1 flex-col p-4 sm:p-5 ${bodyTone}`}>
        <h2 className="mb-2 min-h-[3rem] text-xl font-black tracking-normal text-slate-950 sm:text-2xl">
          {project.title || (isScratch ? `Scratch Project ${project.projectId}` : "My page")}
        </h2>
        <p className="mb-4 min-h-[3.5rem] flex-1 text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
          {project.description || "A creative project made at SP School."}
        </p>
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-black transition-all sm:h-11 sm:text-base ${buttonTone}`}
        >
          View Project
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
    </article>
  );
};

export default function PortfolioShare() {
  const { parentId, childId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadPortfolio = async () => {
      try {
        setStatus("loading");
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/portfolio/${parentId}/${childId}`, {
          method: "GET",
          credentials: "omit",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Portfolio not found.");
        if (!isCancelled) {
          setPortfolio(json);
          setStatus("ready");
          document.title = `${json.child?.name || "Kid"} Portfolio - SP School`;
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Portfolio not found.");
          setStatus("error");
        }
      }
    };

    loadPortfolio();
    return () => {
      isCancelled = true;
    };
  }, [childId, parentId]);

  const child = portfolio?.child || {};
  const childName = child.name || "Student";
  const profilePhotoUrl = portfolio?.owner?.photoUrl || "";
  const aboutText = (child.portfolioAbout || "").trim() || getDefaultPortfolioAbout(childName, child.age);
  const projects = useMemo(() => portfolio?.projects || [], [portfolio]);
  const counts = useMemo(
    () => ({
      all: projects.length,
      scratch: projects.filter((project) => project.type === "scratch").length,
      blocks: projects.filter((project) => project.type === "blocks").length,
    }),
    [projects]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-blue-700">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <img src="/icon.png" alt="SP School" className="mx-auto h-16 w-16 rounded-2xl border border-blue-100 object-contain shadow-sm" />
          <h1 className="mt-6 text-2xl font-black text-slate-950">Oops! Portfolio not found</h1>
          <p className="mt-3 text-base font-medium text-slate-500">{error}</p>
          <Link
            to="/"
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to SP School
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-950 selection:bg-blue-100 selection:text-blue-900">
      <style dangerouslySetInnerHTML={{__html: `
        body { font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        html { scroll-behavior: smooth; }
      `}} />

      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="rounded-xl border border-blue-100 bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
              <img src="/icon.png" alt="SP School" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-xl font-black leading-tight text-slate-950">SP School</p>
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">Student Portfolio</p>
            </div>
          </Link>
          <span className="hidden rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm sm:inline-flex">
            Public Profile
          </span>
        </div>
      </header>

      <main>
        <section
          id="about"
          className="relative overflow-hidden pb-14 pt-12"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #eff6ff 48%, #ecfeff 100%)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,rgba(244,247,251,0)_0%,#f4f7fb_100%)]" />
          <div className="mx-auto max-w-4xl px-4 relative flex flex-col items-center text-center z-10">
            <ProfileAvatar name={childName} photoUrl={profilePhotoUrl} />

            <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-black leading-tight tracking-normal text-blue-700 sm:text-5xl">
              {childName}
            </h1>

            <p className="mb-5 max-w-2xl rounded-xl border border-blue-100 bg-white/90 p-4 text-base font-medium leading-relaxed text-slate-500 shadow-sm">
              {aboutText}
            </p>

            {/* Playful stats badges */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <span className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm">
                 <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> {counts.all} Total Projects
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 shadow-sm">
                 <Sparkles className="w-4 h-4 text-violet-600" /> {counts.scratch} Scratch
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 shadow-sm">
                 <Blocks className="w-4 h-4 text-cyan-700" /> {counts.blocks} Blocks Play
              </span>
            </div>

            <a
              href="#projects"
              className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-blue-700"
            >
              <span className="relative flex items-center gap-2">
                See My Projects <ChevronDown size={22} className="group-hover:animate-bounce" />
              </span>
            </a>
          </div>
        </section>

        {/* Gallery Section */}
        <section
          id="projects"
          className="py-12"
          style={{
            background:
              "linear-gradient(180deg,#f4f7fb 0%,#eff6ff 52%,#f4f7fb 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="mb-8 text-center">
              <h2 className="mb-3 inline-flex w-full items-center justify-center gap-2 text-3xl font-black text-slate-950 sm:text-4xl">
                <Star className="fill-amber-300 text-amber-400" size={30} />
                My Creative Projects
                <Star className="fill-amber-300 text-amber-400" size={30} />
              </h2>
              <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-blue-600" />
              <p className="mt-3 text-base font-bold text-blue-600">Scratch games and Blocks Play creations together.</p>
            </div>

            {projects.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-blue-100 bg-white px-4 py-12 text-center shadow-sm">
                <Smile className="mx-auto mb-4 h-12 w-12 text-blue-300" />
                <h3 className="text-3xl font-black text-slate-950">No projects yet!</h3>
                <p className="text-slate-500 mt-2 font-medium text-lg">I'm still working on my first masterpiece.</p>
              </div>
            ) : (
              <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
                {projects.map((project) => (
                  <ProjectCard key={`${project.type}-${project.id}`} project={project} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Playful Footer */}
      <footer className="border-t border-blue-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Star className="fill-amber-300 text-amber-400" size={32} />
          </div>
          <h3 className="mb-2 text-2xl font-black text-slate-950">Thanks for visiting!</h3>
          <p className="mb-5 text-base font-medium text-blue-600/70">Keep exploring and creating.</p>

          <p className="mt-8 text-xs font-bold tracking-wide text-slate-400">
            BUILT WITH IMAGINATION AT SP SCHOOL
          </p>
        </div>
      </footer>

    </div>
  );
}
