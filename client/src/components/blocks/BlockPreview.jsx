// src/components/blocks/BlockPreview.jsx
import { useState, useRef, useEffect } from "react";
import {
  Plus,
  LayoutPanelTop,
  LayoutTemplate,
  Layout,
  Heading1,
  Type,
  Pointer,
  ImageIcon,
  ListChecks,
  PencilLine,
  Shapes,
} from "lucide-react";

const sectionInsertOptions = [
  {
    kind: "section",
    type: "section",
    label: "Section",
    description: "Add a new section container.",
    icon: LayoutPanelTop,
  },
];

const blockInsertOptions = [
  {
    kind: "block",
    type: "header",
    label: "Header",
    description: "Top banner content.",
    icon: LayoutTemplate,
  },
  {
    kind: "block",
    type: "footer",
    label: "Footer",
    description: "Bottom page content.",
    icon: Layout,
  },
  {
    kind: "block",
    type: "heading",
    label: "Heading",
    description: "Big title text.",
    icon: Heading1,
  },
  {
    kind: "block",
    type: "paragraph",
    label: "Paragraph",
    description: "Normal body text.",
    icon: Type,
  },
  {
    kind: "block",
    type: "button",
    label: "Button",
    description: "Action button.",
    icon: Pointer,
  },
  {
    kind: "block",
    type: "image",
    label: "Image",
    description: "Image block.",
    icon: ImageIcon,
  },
  {
    kind: "block",
    type: "list",
    label: "List",
    description: "Bullet items list.",
    icon: ListChecks,
  },
  {
    kind: "block",
    type: "input",
    label: "Text input",
    description: "User input field.",
    icon: PencilLine,
  },
  {
    kind: "block",
    type: "icons",
    label: "Icons row",
    description: "Icons from HTML tags.",
    icon: Shapes,
  },
];

const insertOptionTones = {
  section: {
    icon: "bg-sky-100 text-sky-700",
    hover: "hover:border-sky-200 hover:bg-sky-50/70",
    title: "text-sky-900",
    desc: "text-sky-700/80",
  },
  header: {
    icon: "bg-violet-100 text-violet-700",
    hover: "hover:border-violet-200 hover:bg-violet-50/70",
    title: "text-violet-900",
    desc: "text-violet-700/80",
  },
  footer: {
    icon: "bg-slate-200 text-slate-700",
    hover: "hover:border-slate-300 hover:bg-slate-50/80",
    title: "text-slate-900",
    desc: "text-slate-600",
  },
  heading: {
    icon: "bg-emerald-100 text-emerald-700",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/70",
    title: "text-emerald-900",
    desc: "text-emerald-700/80",
  },
  paragraph: {
    icon: "bg-amber-100 text-amber-700",
    hover: "hover:border-amber-200 hover:bg-amber-50/70",
    title: "text-amber-900",
    desc: "text-amber-700/80",
  },
  button: {
    icon: "bg-sky-100 text-sky-700",
    hover: "hover:border-sky-200 hover:bg-sky-50/70",
    title: "text-sky-900",
    desc: "text-sky-700/80",
  },
  image: {
    icon: "bg-pink-100 text-pink-700",
    hover: "hover:border-pink-200 hover:bg-pink-50/70",
    title: "text-pink-900",
    desc: "text-pink-700/80",
  },
  list: {
    icon: "bg-lime-100 text-lime-700",
    hover: "hover:border-lime-200 hover:bg-lime-50/70",
    title: "text-lime-900",
    desc: "text-lime-700/80",
  },
  input: {
    icon: "bg-emerald-100 text-emerald-700",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/70",
    title: "text-emerald-900",
    desc: "text-emerald-700/80",
  },
  icons: {
    icon: "bg-violet-100 text-violet-700",
    hover: "hover:border-violet-200 hover:bg-violet-50/70",
    title: "text-violet-900",
    desc: "text-violet-700/80",
  },
  default: {
    icon: "bg-slate-100 text-slate-600",
    hover: "hover:border-slate-200 hover:bg-slate-50",
    title: "text-slate-800",
    desc: "text-slate-500",
  },
};

/**
 * builder = {
 *   rootSectionIds: string[],
 *   sections: { [id]: SectionNode },
 *   blocks: { [id]: BlockNode }
 * }
 *
 * selection = { kind: "section"|"block", id: string } | null
 * dragItem = {
 *   source: "toolbox"|"canvas",
 *   kind: "section"|"block",
 *   type?: string,
 *   id?: string
 * } | null
 */
export default function BlockPreview({
  builder,
  selection,
  onSelect,
  dragItem,
  setDragItem,
  onDropNewSection,
  onDropNewBlock,
  onMoveExistingNode,
  zoom = 1,
  breadcrumb,
  frame = true,
  allowQuickInsert = true,
}) {
  const [hoverSectionId, setHoverSectionId] = useState(null);
  const [hoverRoot, setHoverRoot] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [quickInsertMenu, setQuickInsertMenu] = useState(null);
  const [hoveredSectionId, setHoveredSectionId] = useState(null);
  const [isPageBodyHovered, setIsPageBodyHovered] = useState(false);
  const scrollRef = useRef(null);
  const quickInsertMenuRef = useRef(null);

  useEffect(() => {
    if (!quickInsertMenu) return;

    const handlePointerDown = (event) => {
      if (event.target?.closest?.('[data-quick-insert-trigger="true"]')) {
        return;
      }
      if (quickInsertMenuRef.current?.contains(event.target)) return;
      setQuickInsertMenu(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setQuickInsertMenu(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quickInsertMenu]);

  useEffect(() => {
    if (!allowQuickInsert) {
      setQuickInsertMenu(null);
    }
  }, [allowQuickInsert]);

  const startCanvasDrag = (payload) => {
    setQuickInsertMenu(null);
    setDragItem?.({
      source: "canvas",
      kind: payload.kind,
      id: payload.id,
    });
    setDraggingNodeId(payload.id);
  };

  const stopCanvasDrag = () => {
    setDragItem?.(null);
    setHoverSectionId(null);
    setHoverRoot(false);
    setDraggingNodeId(null);
    setHoveredSectionId(null);
  };

  const isMenuOpen = (scope, sectionId = null) => {
    if (!quickInsertMenu) return false;
    if (quickInsertMenu.scope !== scope) return false;
    if (scope === "root") return true;
    return quickInsertMenu.sectionId === sectionId;
  };

  const toggleQuickInsertMenu = (event, scope, sectionId = null) => {
    if (!allowQuickInsert) return;
    event.preventDefault();
    event.stopPropagation();

    setQuickInsertMenu((prev) => {
      const isSame =
        prev &&
        prev.scope === scope &&
        (scope === "root" || prev.sectionId === sectionId);

      if (isSame) return null;
      return { scope, sectionId };
    });

    if (scope === "section" && sectionId) {
      onSelect?.({ kind: "section", id: sectionId });
    }
  };

  const handleQuickInsert = (event, option, sectionId = null) => {
    event.preventDefault();
    event.stopPropagation();

    if (option.kind === "section") {
      onDropNewSection?.(sectionId);
    } else if (option.kind === "block" && sectionId) {
      onDropNewBlock?.(sectionId, option.type);
    }

    setQuickInsertMenu(null);
  };

  const renderQuickInsertOption = (option, sectionId = null) => {
    const Icon = option.icon;
    const tone = insertOptionTones[option.type] || insertOptionTones.default;

    return (
      <button
        key={`${option.kind}-${option.type}`}
        type="button"
        onClick={(event) => handleQuickInsert(event, option, sectionId)}
        className={`w-full rounded-xl border border-transparent px-2.5 py-2 text-left transition ${tone.hover}`}
      >
        <div className="flex items-start gap-2">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className={`truncate text-[12px] font-semibold ${tone.title}`}>
              {option.label}
            </p>
            <p className={`text-[10px] leading-tight ${tone.desc}`}>
              {option.description}
            </p>
          </div>
        </div>
      </button>
    );
  };

  const renderQuickInsertMenu = (sectionId = null) => {
    const isRootMenu = sectionId == null;

    return (
      <div
        ref={quickInsertMenuRef}
        className="absolute left-1/2 top-full z-40 mt-2 w-[min(92vw,300px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur"
      >
        <div className="max-h-[280px] space-y-2 overflow-y-auto blocks-scrollbar pr-1">
          <div>
            <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Sections
            </p>
            <div className="space-y-1">
              {sectionInsertOptions.map((option) =>
                renderQuickInsertOption(option, sectionId)
              )}
            </div>
          </div>

          {!isRootMenu && (
            <div>
              <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Blocks
              </p>
              <div className="space-y-1">
                {blockInsertOptions.map((option) =>
                  renderQuickInsertOption(option, sectionId)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleCanvasDragOver = (e) => {
    if (!dragItem) return;
    e.preventDefault();

    const container = scrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const threshold = 40;

    if (e.clientY < rect.top + threshold) {
      container.scrollBy({ top: -8, behavior: "smooth" });
    } else if (e.clientY > rect.bottom - threshold) {
      container.scrollBy({ top: 8, behavior: "smooth" });
    }
  };

  const handleRootDragEnter = (e) => {
    if (!dragItem || dragItem.kind !== "section") return;
    e.preventDefault();
    e.stopPropagation();
    setHoverRoot(true);
  };

  const handleRootDragLeave = (e) => {
    e.stopPropagation();
    setHoverRoot(false);
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverRoot(false);
    setQuickInsertMenu(null);

    if (!dragItem) return;

    if (dragItem.source === "toolbox" && dragItem.kind === "section") {
      onDropNewSection?.(null);
    } else if (dragItem.source === "canvas" && dragItem.kind === "section") {
      onMoveExistingNode?.({
        kind: "section",
        id: dragItem.id,
        targetSectionId: null,
      });
    }

    setDragItem?.(null);
  };

  const handleSectionDragEnter = (e, sectionId) => {
    if (!dragItem) return;
    e.preventDefault();
    e.stopPropagation();
    setHoverSectionId(sectionId);
  };

  const handleSectionDragLeave = (e, sectionId) => {
    e.stopPropagation();
    if (hoverSectionId === sectionId) setHoverSectionId(null);
  };

  const handleSectionDrop = (e, sectionId) => {
    e.preventDefault();
    e.stopPropagation();
    setHoverSectionId(null);
    setQuickInsertMenu(null);

    if (!dragItem) return;

    if (dragItem.source === "toolbox") {
      if (dragItem.kind === "section") {
        onDropNewSection?.(sectionId);
      } else if (dragItem.kind === "block") {
        onDropNewBlock?.(sectionId, dragItem.type);
      }
    } else if (dragItem.source === "canvas") {
      onMoveExistingNode?.({
        kind: dragItem.kind,
        id: dragItem.id,
        targetSectionId: sectionId,
      });
    }

    setDragItem?.(null);
  };

  const getAlignClass = (align) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getJustifyClass = (align) => {
    switch (align) {
      case "center":
        return "justify-center";
      case "right":
        return "justify-end";
      default:
        return "justify-start";
    }
  };

  const getFontSize = (block, fallback) => {
    if (typeof block.fontSize === "number" && block.fontSize > 0) {
      return `${block.fontSize}px`;
    }
    return `${fallback}px`;
  };

  const renderBlock = (blockId, sectionColumns) => {
    const block = builder.blocks[blockId];
    if (!block) return null;

    const isSelected =
      selection?.kind === "block" && selection.id === blockId;

    const span = Math.max(
      1,
      Math.min(block.widthSpan || 1, sectionColumns || 1)
    );
    const minHeight =
      typeof block.minHeight === "number" && block.minHeight > 0
        ? `${block.minHeight}px`
        : null;

    const alignClass = getAlignClass(block.align);
    const justifyClass = getJustifyClass(block.align);

    // wrapper شفاف (من غير كرت)، وفيه margin/padding من إعدادات البلوك
    const wrapperStyle = {
      gridColumn: `span ${span}`,
      minHeight: block.type === "image" ? undefined : minHeight,
      backgroundColor:
        block.type === "button"
          ? "transparent"
          : block.backgroundColor || "transparent",
      margin:
        typeof block.margin === "number" ? `${block.margin}px` : undefined,
      padding:
        typeof block.padding === "number" ? `${block.padding}px` : undefined,
    };

    const wrapperClass = `cursor-move w-full transition ${
      isSelected ? "ring-2 ring-sky-300 rounded-xl" : ""
    } ${draggingNodeId === blockId ? "opacity-60 scale-[0.99]" : ""}`;

    const textColor = block.textColor || "#0f172a";

    const commonTextStyle = {
      color: textColor,
      whiteSpace: "pre-line",
    };

    const listItems = Array.isArray(block.items)
      ? block.items
      : block.text
      ? block.text.split("\n").map((x) => x.trim()).filter(Boolean)
      : [];

    return (
      <div
        key={blockId}
        draggable
        onDragStart={() =>
          startCanvasDrag({ kind: "block", id: blockId })
        }
        onDragEnd={stopCanvasDrag}
        onClick={() => onSelect?.({ kind: "block", id: blockId })}
        style={wrapperStyle}
        className={wrapperClass}
      >
        {/* محتوى البلوك نفسه بدون كروت/هيدر */}

        {block.type === "header" && (
          <div className={alignClass} style={commonTextStyle}>
            <h2
              className="font-extrabold"
              style={{ fontSize: getFontSize(block, 24) }}
            >
              {block.text || "Page header area"}
            </h2>
          </div>
        )}

        {block.type === "footer" && (
          <div className={alignClass} style={commonTextStyle}>
            <p
              className="text-xs"
              style={{ fontSize: getFontSize(block, 12) }}
            >
              {block.text || "Footer text here"}
            </p>
          </div>
        )}

        {block.type === "heading" && (
          <h1
            className={`font-extrabold ${alignClass}`}
            style={{
              ...commonTextStyle,
              fontSize: getFontSize(block, 22),
            }}
          >
            {block.text || "My awesome title"}
          </h1>
        )}

        {block.type === "paragraph" && (
          <p
            className={`mt-1 text-xs md:text-sm ${alignClass}`}
            style={{
              ...commonTextStyle,
              fontSize: getFontSize(block, 14),
            }}
          >
            {block.text ||
              "This is my first web page created with blocks!"}
          </p>
        )}

        {block.type === "list" && (
          <div className={alignClass} style={commonTextStyle}>
            {listItems.length === 0 ? (
              <p
                className="text-[11px] text-slate-400"
                style={{ fontSize: getFontSize(block, 12) }}
              >
                Add list items in the settings.
              </p>
            ) : (
              <ul
                className="list-disc list-inside mt-1 text-xs md:text-sm"
                style={{ fontSize: getFontSize(block, 14) }}
              >
                {listItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {block.type === "input" && (
          <div className={`mt-1 flex ${justifyClass}`}>
            <div className="w-full max-w-xs">
              {block.label && (
                <label
                  className="block mb-1 text-[11px] text-slate-600"
                  style={commonTextStyle}
                >
                  {block.label}
                </label>
              )}
              <input
                type={block.inputType || "text"}
                placeholder={block.placeholder || "Type here"}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                style={{
                  color: textColor,
                  fontSize: getFontSize(block, 14),
                  backgroundColor: block.backgroundColor || "#ffffff",
                }}
              />
            </div>
          </div>
        )}

        {block.type === "icons" && (
          <div
            className={`mt-1 flex flex-wrap gap-2 ${justifyClass}`}
            style={commonTextStyle}
          >
            {(block.icons || "")
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean)
              .map((html, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}

            {(!block.icons || block.icons.trim() === "") && (
              <span className="text-[11px] text-slate-400">
                Add &lt;i&gt; icons in settings (one per line).
              </span>
            )}
          </div>
        )}

        {block.type === "button" && (
          <div className={`mt-1 flex ${justifyClass}`}>
            <button
              type="button"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold transition ${
                block.variant === "outline"
                  ? "border border-sky-500 text-sky-700 bg-transparent hover:bg-sky-50"
                  : block.variant === "soft"
                  ? "bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-100"
                  : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-200"
              }`}
              style={{
                backgroundColor:
                  block.variant === "primary" && block.backgroundColor
                    ? block.backgroundColor
                    : undefined,
                color: textColor,
                fontSize: getFontSize(block, 14),
              }}
            >
              {block.text || "Click me"}
            </button>
          </div>
        )}

        {block.type === "image" && (
          <div className={`mt-1 flex ${justifyClass}`}>
            <img
              src={
                block.src ||
                "https://placehold.co/360x220?text=Image"
              }
              alt={block.alt || "Image"}
              className={`max-w-full object-cover ${
                block.rounded ?? true ? "rounded-2xl" : "rounded"
              }`}
              style={
                minHeight
                  ? { minHeight }
                  : { maxHeight: "160px" }
              }
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/360x220?text=Image";
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderSection = (sectionId, depth = 0) => {
    const section = builder.sections[sectionId];
    if (!section) return null;

    const settings = section.settings || {};
    const columns = Math.max(1, Math.min(settings.columns || 1, 4));

    const isSelected =
      selection?.kind === "section" && selection.id === sectionId;
    const isHover = hoverSectionId === sectionId;
    const isSelectedSection =
      selection?.kind === "section" && selection.id === sectionId;
    const showSectionAddTrigger =
      allowQuickInsert &&
      (isMenuOpen("section", sectionId) ||
        hoveredSectionId === sectionId ||
        isSelectedSection);
    const showDropHint =
      dragItem &&
      (dragItem.kind === "block" || dragItem.kind === "section");
    const isDraggingSection = draggingNodeId === sectionId;

    return (
      <div
        key={sectionId}
        className={`transition ${
          isHover ? "ring-2 ring-sky-300 rounded-3xl" : ""
        } ${isDraggingSection ? "opacity-70" : ""}`}
        onDragOver={handleCanvasDragOver}
        onDrop={(e) => handleSectionDrop(e, sectionId)}
        onDragEnter={(e) => handleSectionDragEnter(e, sectionId)}
        onDragLeave={(e) => handleSectionDragLeave(e, sectionId)}
        onMouseEnter={() => setHoveredSectionId(sectionId)}
        onMouseLeave={() =>
          setHoveredSectionId((prev) =>
            prev === sectionId ? null : prev
          )
        }
      >
        <div
          className={`w-full relative transition ${
            isSelected
              ? "ring-2 ring-sky-400"
              : showSectionAddTrigger
              ? "ring-1 ring-sky-200"
              : ""
          }`}
          style={{
            margin: settings.margin ?? 0,
            padding: settings.padding ?? 0,
            backgroundColor: settings.backgroundColor || "#ffffff",
            backgroundImage: settings.backgroundImage
              ? `url(${settings.backgroundImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: settings.borderRadius ?? 20,
            borderWidth: settings.borderWidth ?? 0,
            borderStyle:
              settings.borderWidth && settings.borderWidth > 0
                ? "solid"
                : "none",
            width: settings.width || "100%",
            height: settings.height || "auto",
          }}
          draggable
          onDragStart={() =>
            startCanvasDrag({ kind: "section", id: sectionId })
          }
          onDragEnd={stopCanvasDrag}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.({ kind: "section", id: sectionId });
          }}
        >
          {showDropHint && (
            <div
              className={`pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-dashed transition ${
                isHover
                  ? "border-sky-400 bg-sky-50/60"
                  : "border-slate-200/70 bg-white/40"
              }`}
              style={{ borderRadius: settings.borderRadius ?? 20 }}
            >
              {isHover && (
                <div className="absolute -top-3 left-3 rounded-full bg-sky-600 text-white text-[10px] px-2 py-0.5 shadow">
                  Drop here
                </div>
              )}
            </div>
          )}
          {showSectionAddTrigger && (
            <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
              <button
                type="button"
                data-quick-insert-trigger="true"
                onClick={(event) =>
                  toggleQuickInsertMenu(event, "section", sectionId)
                }
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold transition shadow-sm ${
                  isMenuOpen("section", sectionId)
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white/95 text-slate-600 hover:border-sky-300 hover:text-sky-700"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add here
              </button>
              {isMenuOpen("section", sectionId) &&
                renderQuickInsertMenu(sectionId)}
            </div>
          )}
          <div
            className="w-full rounded-2xl p-3"
            style={{
              backgroundColor: "transparent",
            }}
          >
            {section.children.length === 0 && (
              <div className="text-[11px] text-slate-400 text-center py-6">
                Drag blocks or child sections here.
              </div>
            )}

            {section.children.length > 0 && (
              <div
                className="w-full"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: "12px",
                }}
              >
                {section.children.map((child) =>
                  child.kind === "section"
                    ? renderSection(child.id, depth + 1)
                    : renderBlock(child.id, columns)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const zoomScale = zoom || 1;

  const pageBody = (
    <div
      style={{
        transform: `scale(${zoomScale})`,
        transformOrigin: "top left",
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-100 px-4 py-5 min-h-[220px]"
        onMouseEnter={() => setIsPageBodyHovered(true)}
        onMouseLeave={() => {
          setIsPageBodyHovered(false);
          setHoveredSectionId(null);
        }}
      >
        {builder.rootSectionIds.length === 0 && (
          <div
            role={allowQuickInsert ? "button" : undefined}
            tabIndex={allowQuickInsert ? 0 : undefined}
            data-quick-insert-trigger={
              allowQuickInsert ? "true" : undefined
            }
            onClick={
              allowQuickInsert
                ? (event) => toggleQuickInsertMenu(event, "root")
                : undefined
            }
            onKeyDown={
              allowQuickInsert
                ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    toggleQuickInsertMenu(event, "root");
                  }
                }
                : undefined
            }
            className={`flex items-center justify-center text-xs text-slate-400 text-center px-4 py-10 rounded-2xl border border-dashed ${
              hoverRoot
                ? "border-sky-400 bg-sky-50/60"
                : "border-slate-200"
            }`}
          >
            {allowQuickInsert ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                Add your first section
              </span>
            ) : (
              <span>No sections yet.</span>
            )}
          </div>
        )}

        {builder.rootSectionIds.map((sectionId) =>
          renderSection(sectionId, 0)
        )}

        {allowQuickInsert &&
          (isMenuOpen("root") ||
            (isPageBodyHovered && !hoveredSectionId)) && (
          <div className="relative mt-4 flex justify-center">
            <button
              type="button"
              data-quick-insert-trigger="true"
              onClick={(event) => toggleQuickInsertMenu(event, "root")}
              className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition shadow-sm ${
                isMenuOpen("root")
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white/95 text-slate-600 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Add section here
            </button>
            {isMenuOpen("root") && renderQuickInsertMenu(null)}
          </div>
        )}
      </div>
    </div>
  );

  if (!frame) {
    return <div className="relative">{pageBody}</div>;
  }

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Page preview
          </h2>
          <p className="text-[11px] text-slate-500">
            Drag sections and blocks here. What you see is what your page
            will look like.
          </p>
        </div>
        <div className="text-[10px] text-slate-400 text-right max-w-[200px]">
          {breadcrumb}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100 p-3 flex-1 overflow-auto relative"
        onDragOver={handleCanvasDragOver}
        onDrop={handleRootDrop}
        onDragEnter={handleRootDragEnter}
        onDragLeave={handleRootDragLeave}
      >
        {dragItem?.kind === "section" && (
          <div
            className={`pointer-events-none absolute inset-3 rounded-2xl border-2 border-dashed transition ${
              hoverRoot
                ? "border-sky-400 bg-sky-50/60"
                : "border-slate-200/70 bg-white/40"
            }`}
          >
            {hoverRoot && (
              <div className="absolute -top-3 left-4 rounded-full bg-sky-600 text-white text-[10px] px-2 py-0.5 shadow">
                Drop section here
              </div>
            )}
          </div>
        )}
        <div className="flex gap-1 mb-3">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        {pageBody}
      </div>
    </div>
  );
}
