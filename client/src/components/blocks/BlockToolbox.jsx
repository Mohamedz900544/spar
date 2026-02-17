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
    type: "input",
    label: "Text input",
    description: "Single box where users can type.",
    icon: Pointer, // استخدم أي أيقونة عندك
    gradient: "from-emerald-100 to-emerald-50",
  },
  {
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
  onQuickAddSection,
  onQuickAddBlock,
}) {
  const handleDragStart = (tool) => {
    onToolDragStart?.({
      source: "toolbox",
      kind: tool.kind, // "section" | "block"
      type: tool.type,
    });
  };

  const handleDragEnd = () => {
    onToolDragEnd?.();
  };

  const renderToolButton = (tool) => {
    const Icon = tool.icon;
    const isSection = tool.kind === "section";

    return (
      <button
        key={`${tool.kind}-${tool.type}`}
        type="button"
        draggable
        onDragStart={() => handleDragStart(tool)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (isSection) onQuickAddSection?.();
          else onQuickAddBlock?.(tool.type);
        }}
        className="w-full text-left rounded-2xl bg-gradient-to-r border border-slate-100 hover:border-sky-200 hover:from-white hover:to-white transition p-2 flex items-center gap-2 cursor-grab active:cursor-grabbing"
      >
        <div
          className={`h-9 w-9 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}
        >
          <Icon className="w-4 h-4 text-slate-700" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-slate-800">
            {tool.label}
          </div>
          <div className="text-[11px] text-slate-500">
            {tool.description}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3 flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Block toolbox
      </h2>
      <p className="text-[11px] text-slate-500 mb-3">
        1. Drag a <span className="font-semibold text-sky-600">
          Section
        </span>{" "}
        into the canvas. 2. Drag blocks into that section.
      </p>

      <div className="space-y-3 overflow-y-auto">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1">
            Sections
          </p>
          <div className="space-y-2">
            {sectionTools.map(renderToolButton)}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2" />

        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1">
            Blocks
          </p>
          <div className="space-y-2">{blockTools.map(renderToolButton)}</div>
        </div>
      </div>
    </div>
  );
}
