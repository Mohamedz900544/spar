// src/components/blocks/BlockPreview.jsx
import { useState, useRef } from "react";

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
}) {
  const [hoverSectionId, setHoverSectionId] = useState(null);
  const [hoverRoot, setHoverRoot] = useState(false);
  const scrollRef = useRef(null);

  const startCanvasDrag = (payload) => {
    setDragItem?.({
      source: "canvas",
      kind: payload.kind,
      id: payload.id,
    });
  };

  const stopCanvasDrag = () => {
    setDragItem?.(null);
    setHoverSectionId(null);
    setHoverRoot(false);
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
        : "auto";

    const alignClass = getAlignClass(block.align);
    const justifyClass = getJustifyClass(block.align);

    // wrapper شفاف (من غير كرت)، وفيه margin/padding من إعدادات البلوك
    const wrapperStyle = {
      gridColumn: `span ${span}`,
      minHeight,
      backgroundColor:
        block.type === "button"
          ? "transparent"
          : block.backgroundColor || "transparent",
      margin:
        typeof block.margin === "number" ? `${block.margin}px` : undefined,
      padding:
        typeof block.padding === "number" ? `${block.padding}px` : undefined,
    };

    const wrapperClass = `cursor-move w-full ${
      isSelected ? "ring-2 ring-sky-300 rounded-xl" : ""
    }`;

    const textColor = block.textColor || "#0f172a";

    const commonTextStyle = {
      color: textColor,
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
              className={`max-h-40 max-w-full object-cover ${
                block.rounded ?? true ? "rounded-2xl" : "rounded"
              }`}
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

    return (
      <div
        key={sectionId}
        className={`mb-4 transition ${
          isHover ? "ring-2 ring-sky-300 rounded-3xl" : ""
        }`}
        onDragOver={handleCanvasDragOver}
        onDrop={(e) => handleSectionDrop(e, sectionId)}
        onDragEnter={(e) => handleSectionDragEnter(e, sectionId)}
        onDragLeave={(e) => handleSectionDragLeave(e, sectionId)}
      >
        <div
          className={`w-full ${
            isSelected ? "ring-2 ring-sky-400" : ""
          }`}
          style={{
            margin: settings.margin ?? 12,
            padding: settings.padding ?? 24,
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
        className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100 p-3 flex-1 overflow-auto"
        onDragOver={handleCanvasDragOver}
        onDrop={handleRootDrop}
        onDragEnter={handleRootDragEnter}
        onDragLeave={handleRootDragLeave}
      >
        <div className="flex gap-1 mb-3">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top left",
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-5 min-h-[220px]">
            {builder.rootSectionIds.length === 0 && (
              <div
                className={`flex items-center justify-center text-xs text-slate-400 text-center px-4 py-10 rounded-2xl border border-dashed ${
                  hoverRoot
                    ? "border-sky-400 bg-sky-50/60"
                    : "border-slate-200"
                }`}
              >
                Drag a Section from the toolbox to start building your page.
              </div>
            )}

            {builder.rootSectionIds.map((sectionId) =>
              renderSection(sectionId, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
