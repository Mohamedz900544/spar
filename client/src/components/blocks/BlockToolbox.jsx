// src/components/blocks/BlockToolbox.jsx
import {
  Heading1,
  Type,
  ImageIcon,
  Pointer,
  LayoutPanelTop,
  LayoutTemplate,
  Layout,
  ListChecks,
  RotateCw,
  Save,
  Undo2,
  Redo2,
} from "lucide-react";

const sectionTools = [
  {
    kind: "section",
    type: "section",
    label: "Section",
    description: "Big area that can hold blocks.",
    icon: LayoutPanelTop,
    gradient: "from-sky-100 to-sky-50",
  },
];

const blockTools = [
  {
    kind: "block",
    type: "header",
    label: "Header",
    description: "Top area of the page.",
    icon: LayoutTemplate,
    gradient: "from-violet-100 to-violet-50",
  },
  {
    kind: "block",
    type: "footer",
    label: "Footer",
    description: "Bottom area of the page.",
    icon: Layout,
    gradient: "from-slate-100 to-slate-50",
  },
  {
    kind: "block",
    type: "heading",
    label: "Heading",
    description: "Big title for your page.",
    icon: Heading1,
    gradient: "from-emerald-100 to-emerald-50",
  },
  {
    kind: "block",
    type: "paragraph",
    label: "Paragraph",
    description: "Some explanation text.",
    icon: Type,
    gradient: "from-amber-100 to-amber-50",
  },
  {
    kind: "block",
    type: "button",
    label: "Button",
    description: "A friendly clickable button.",
    icon: Pointer,
    gradient: "from-sky-100 to-sky-50",
  },
  {
    kind: "block",
    type: "image",
    label: "Image",
    description: "Fun picture block.",
    icon: ImageIcon,
    gradient: "from-pink-100 to-pink-50",
  },
  {
    kind: "block",
    type: "list",
    label: "List",
    description: "Bullet list of items.",
    icon: ListChecks,
    gradient: "from-lime-100 to-lime-50",
  },
  {
    kind: "block",
    type: "input",
    label: "Text input",
    description: "Single box where users can type.",
    icon: Pointer,
    gradient: "from-emerald-100 to-emerald-50",
  },
  {
    kind: "block",
    type: "icons",
    label: "Icons row",
    description: "Row of icons using <i> tags.",
    icon: ImageIcon,
    gradient: "from-violet-100 to-violet-50",
  },
];

export default function BlockToolbox({
  onToolDragStart,
  onToolDragEnd,
  pageTitle,
  onPageTitleChange,
  onLoadLatest,
  loading = false,
  onSharePreview,
  onSave,
  saving = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onQuickAddSection,
  onQuickAddBlock,
}) {
  const handleDragStart = (tool) => {
    onToolDragStart?.({
      source: "toolbox",
      kind: tool.kind || "block",
      type: tool.type,
    });
  };

  const handleDragEnd = () => {
    onToolDragEnd?.();
  };

  const renderToolButton = (tool) => {
    const Icon = tool.icon;
    const kind = tool.kind || "block";
    const isSection = kind === "section";

    return (
      <button
        key={`${kind}-${tool.type}`}
        type="button"
        draggable
        onDragStart={() => handleDragStart(tool)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (isSection) onQuickAddSection?.();
          else onQuickAddBlock?.(tool.type);
        }}
        className="shrink-0 min-w-[150px] text-left rounded-2xl bg-gradient-to-r border border-slate-100 hover:border-sky-200 hover:from-white hover:to-white transition px-2.5 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing"
      >
        <div
          className={`h-8 w-8 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}
        >
          <Icon className="w-3.5 h-3.5 text-slate-700" />
        </div>
        <div className="flex-1">
          <div className="text-[12px] font-semibold text-slate-800">
            {tool.label}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            {tool.description}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3">


      <div className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-end gap-3">
            <div className="xl:w-[280px] shrink-0">
            {/* <p className="text-[11px] font-semibold text-slate-500 mb-2">
              Sections
            </p> */}
            {/* <div className="toolbox-scrollbar flex gap-2 overflow-x-auto pb-1 scroll-smooth">
              {sectionTools.map(renderToolButton)}
            </div> */}
          </div>
          
          <div className="flex-1 min-w-0 md:flex md:flex-col md:items-end">
          
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-end gap-2">
              <input
                type="text"
                value={pageTitle || ""}
                onChange={(e) => onPageTitleChange?.(e.target.value)}
                placeholder="Page title"
                className="w-full md:w-[240px] text-black rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
              />
              <div className="flex gap-2 flex-wrap md:justify-end">
                <button
                  type="button"
                  onClick={onLoadLatest}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition text-xs"
                >
                  <RotateCw className="w-3 h-3 mr-1" />
                  {loading ? "Loading..." : "Load latest"}
                </button>
                <button
                  type="button"
                  onClick={onSharePreview}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-3 py-2 font-semibold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition text-xs"
                >
                  Share Preview
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-3 py-2 font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              
          <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo2 className="w-3 h-3" />
              </button>
            </div>
            </div>
          
          </div>

        </div>

        <div className="border-t border-slate-100 my-2" />

        {/* <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-2">
            Blocks
          </p>
          <div className="toolbox-scrollbar flex gap-2 overflow-x-auto pb-1 scroll-smooth">
            {blockTools.map(renderToolButton)}
          </div>
        </div> */}
      </div>
    </div>
  );
}
