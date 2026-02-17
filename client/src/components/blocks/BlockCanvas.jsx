// src/components/blocks/BlockCanvas.jsx
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Type,
  Heading1,
  ImageIcon,
  Pointer,
  LayoutTemplate,
  Layout,
  ListChecks,
  Trash2,
  PlusSquare,
} from "lucide-react";

export default function BlockCanvas({
  builder,
  selection,
  onSelect,
  onDeleteNode,
  onAddChildSection,
  onDuplicateBlock,
}) {
  const isSelected = (kind, id) =>
    selection?.kind === kind && selection?.id === id;

  const handleSelectSection = (id) =>
    onSelect?.({ kind: "section", id: id || null });

  const handleSelectBlock = (id) =>
    onSelect?.({ kind: "block", id: id || null });

  const getBlockIcon = (block) => {
    switch (block.type) {
      case "heading":
        return Heading1;
      case "paragraph":
        return Type;
      case "image":
        return ImageIcon;
      case "button":
        return Pointer;
      case "header":
        return LayoutTemplate;
      case "footer":
        return Layout;
      case "list":
        return ListChecks;
      default:
        return Type;
    }
  };

  const getBlockLabel = (block) => {
    if (block.type === "header") return block.text || "Header";
    if (block.type === "footer") return block.text || "Footer";
    if (block.type === "list") return "List block";
    if (block.type === "heading") return block.text || "Heading";
    if (block.type === "paragraph") return block.text || "Paragraph";
    if (block.type === "button") return block.text || "Button";
    if (block.type === "image") return "Image";
    return "Block";
  };

  const renderBlockNode = (blockId, depth) => {
    const block = builder.blocks[blockId];
    if (!block) return null;

    const Icon = getBlockIcon(block);
    const selected = isSelected("block", blockId);

    return (
      <div
        key={blockId}
        className={`flex items-center justify-between rounded-2xl px-2 py-1.5 text-xs mt-1 ${
          selected
            ? "bg-sky-50 border border-sky-300"
            : "bg-slate-50 border border-slate-100"
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelectBlock(blockId)}
          className="flex items-center gap-1 flex-1 text-left"
        >
          <span className="text-[10px] text-slate-400">{depth + 1}</span>
          <Icon className="w-3 h-3 text-slate-500" />
          <span className="truncate text-slate-700">
            {getBlockLabel(block)}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicateBlock?.(blockId)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <PlusSquare className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteNode?.({ kind: "block", id: blockId })}
            className="p-1 rounded-lg hover:bg-rose-50 text-rose-500"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderSectionNode = (sectionId, depth = 0) => {
    const section = builder.sections[sectionId];
    if (!section) return null;

    const expanded = true;
    const selected = isSelected("section", sectionId);

    return (
      <div key={sectionId} className="mt-1">
        <div
          className={`flex items-center justify-between rounded-2xl px-2 py-1.5 text-xs ${
            selected
              ? "bg-sky-50 border border-sky-300"
              : "bg-white border border-slate-100"
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-0.5 rounded-lg text-slate-500"
              disabled
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection(sectionId)}
              className="flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-sky-500" />
              <span className="font-semibold text-slate-800 truncate">
                {section.label || "Section"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAddChildSection?.(sectionId)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <PlusSquare className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() =>
                onDeleteNode?.({ kind: "section", id: sectionId })
              }
              className="p-1 rounded-lg hover:bg-rose-50 text-rose-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="ps-4 mt-1 border-l border-slate-100">
            {section.children.map((child) =>
              child.kind === "section"
                ? renderSectionNode(child.id, depth + 1)
                : renderBlockNode(child.id, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Page blocks
          </h2>
          <p className="text-[11px] text-slate-500">
            Tree of all sections and blocks.
          </p>
        </div>
      </div>

      <div className="mt-2 overflow-y-auto flex-1 min-h-[160px]">
        {builder.rootSectionIds.length === 0 && (
          <div className="h-full min-h-[120px] rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 flex items-center justify-center text-xs text-sky-600 text-center px-4">
            Your page is empty. Drag a Section from the
            toolbox to start.
          </div>
        )}

        {builder.rootSectionIds.map((sectionId) =>
          renderSectionNode(sectionId, 0)
        )}
      </div>
    </div>
  );
}
