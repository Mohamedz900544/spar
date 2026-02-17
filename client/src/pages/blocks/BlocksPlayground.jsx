// src/pages/blocks/BlocksPlayground.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles, Save, RotateCw, Undo2, Redo2 } from "lucide-react";

import BlockToolbox from "../../components/blocks/BlockToolbox";
import BlockCanvas from "../../components/blocks/BlockCanvas";
import BlockPreview from "../../components/blocks/BlockPreview";
import BlockPropertiesPanel from "../../components/blocks/BlockPropertiesPanel";

import useBlockProjects from "./hooks/useBlockProject";
import toast from "react-hot-toast";
// src/pages/blocks/BlocksPlayground.jsx


const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const createDefaultSectionSettings = () => ({
  width: "100%",
  height: "auto",
  padding: 24,
  margin: 12,
  backgroundColor: "#ffffff",
  backgroundImage: "",
  borderRadius: 20,
  borderWidth: 0,
  columns: 1,
});

const createEmptyBuilder = () => ({
  rootSectionIds: [],
  sections: {},
  blocks: {},
});

const createSectionNode = (parentId = null, label = "Section") => ({
  id: makeId("section"),
  kind: "section",
  parentId,
  label,
  settings: createDefaultSectionSettings(),
  children: [],
});

const createBlockNode = (type, parentId) => {
  const base = {
    id: makeId("block"),
    kind: "block",
    parentId,
    type,
    align: "left",
    widthSpan: 1,
    minHeight: null,
    textColor: "#0f172a",
    backgroundColor: "#ffffff",
    margin: 0,
    padding: 0,
  };

  switch (type) {
    case "icons":
      return {
        ...base,
        type: "icons",
        icons:
          '<i class="fa-solid fa-star"></i>\n<i class="fa-solid fa-heart"></i>',
        align: "center",
        margin: 4,
        padding: 4,
      };

    case "input":
      return {
        ...base,
        type: "input",
        label: "Your name",
        placeholder: "Type here",
        inputType: "text",
        fontSize: 14,
        margin: 4,
        padding: 4,
      };

    case "header":
      return {
        ...base,
        text: "Page header area",
        align: "center",
        fontSize: 24,
        backgroundColor: "#e0f2fe",
      };
    case "footer":
      return {
        ...base,
        text: "Footer text here",
        align: "center",
        fontSize: 12,
        backgroundColor: "#f1f5f9",
      };
    case "heading":
      return {
        ...base,
        text: "My awesome title",
        align: "center",
        fontSize: 22,
      };
    case "paragraph":
      return {
        ...base,
        text: "This is my first web page created with blocks!",
        align: "left",
        fontSize: 14,
      };
    case "button":
      return {
        ...base,
        text: "Click me",
        align: "center",
        variant: "primary",
        fontSize: 14,
        textColor: "black",
      };
    case "image":
      return {
        ...base,
        src: "https://placekitten.com/360/220",
        alt: "Cute image",
        rounded: true,
      };
    case "list":
      return {
        ...base,
        items: ["First item", "Second item"],
        align: "left",
        fontSize: 14,
      };
    default:
      return base;
  }
};

// Legacy: convert { blocks: [...] } into new builder
const convertLegacyDataToBuilder = (data) => {
  const builder = createEmptyBuilder();
  const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
  if (blocks.length === 0) return builder;

  const section = createSectionNode(null, "Main section");
  builder.sections[section.id] = section;
  builder.rootSectionIds.push(section.id);

  blocks.forEach((b) => {
    const id = b.id || makeId("block");
    builder.blocks[id] = {
      ...b,
      id,
      kind: "block",
      parentId: section.id,
      widthSpan: b.widthSpan || 1,
      minHeight: b.minHeight ?? null,
      align: b.align || "left",
    };
    builder.sections[section.id].children.push({
      kind: "block",
      id,
    });
  });

  return builder;
};

export default function BlocksPlayground() {

  const [state, setState] = useState({
    title: "My first page",
    zoom: 1,
    builder: createEmptyBuilder(),
  });
  const [selection, setSelection] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [dragItem, setDragItem] = useState(null);
  const [autoSaveReady, setAutoSaveReady] = useState(false);

  const { current, loading, saving, error, loadLastProject, saveProject } =
    useBlockProjects();

  const combinedError = localError || error;

  // Undo / redo
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const lastSavedRef = useRef(null);

  const resetHistory = (snapshot) => {
    historyRef.current = [snapshot];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  };

  const pushHistory = (snapshot) => {
    const truncated = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    );
    truncated.push(snapshot);
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  };

  const updateStateWithHistory = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  };

  const updateBuilder = (fn) => {
    updateStateWithHistory((prev) => {
      const nextBuilder = fn(prev.builder);
      return { ...prev, builder: nextBuilder };
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    setState(snapshot);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const handleRedo = () => {
    if (
      historyIndexRef.current >=
      historyRef.current.length - 1
    )
      return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    setState(snapshot);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  // Initial load
  useEffect(() => {
    const run = async () => {
      setStatusMessage("");
      setLocalError("");
      try {
        const project = await loadLastProject();
        if (project && project.data) {
          const data = project.data || {};
          const builder = data.builder
            ? data.builder
            : convertLegacyDataToBuilder(data);
          const zoom =
            typeof data.zoom === "number" && data.zoom > 0
              ? data.zoom
              : 1;

          const snapshot = {
            title: project.title || "My page",
            zoom,
            builder,
          };

          setState(snapshot);
          resetHistory(snapshot);
          lastSavedRef.current = JSON.stringify(snapshot);
          setStatusMessage("Loaded your latest saved page.");
        } else {
          const snapshot = {
            title: "My first page",
            zoom: 1,
            builder: createEmptyBuilder(),
          };
          setState(snapshot);
          resetHistory(snapshot);
          lastSavedRef.current = JSON.stringify(snapshot);
          setStatusMessage(
            "No saved pages yet. Drag a Section to start."
          );
        }
      } catch (err) {
        console.error("initial load error:", err);
        setLocalError(err.message || "Failed to load your saved page.");
        const snapshot = {
          title: "My first page",
          zoom: 1,
          builder: createEmptyBuilder(),
        };
        setState(snapshot);
        resetHistory(snapshot);
        lastSavedRef.current = JSON.stringify(snapshot);
      } finally {
        setAutoSaveReady(true);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save every 5 minutes (only if changed)
  useEffect(() => {
    if (!autoSaveReady) return;

    const interval = setInterval(() => {
      const snapshot = JSON.stringify({
        title: state.title || "My page",
        zoom: state.zoom,
        builder: state.builder,
      });

      if (snapshot === lastSavedRef.current) return;

      saveProject({
        title: state.title || "My page",
        data: {
          builder: state.builder,
          zoom: state.zoom,
        },
      })
        .then(() => {
          lastSavedRef.current = snapshot;
          setStatusMessage("Auto-saved.");
        })
        .catch((err) => {
          console.error("auto-save error:", err);
          setLocalError(err.message || "Auto-save failed.");
        });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoSaveReady, state.title, state.zoom, state.builder, saveProject]);

  const handleManualSave = async () => {
    setStatusMessage("");
    setLocalError("");
    try {
      const project = await saveProject({
        title: state.title || "My page",
        data: { builder: state.builder, zoom: state.zoom },
      });
      if (project) {
        const snapshot = {
          title: project.title || state.title,
          zoom: state.zoom,
          builder: state.builder,
        };
        lastSavedRef.current = JSON.stringify(snapshot);
      }
      setStatusMessage("Page saved.");
    } catch (err) {
      console.error("manual save error:", err);
      setLocalError(err.message || "Failed to save your page.");
    }
  };

  const handleReloadLatest = async () => {
    setStatusMessage("");
    setLocalError("");
    try {
      const project = await loadLastProject();
      if (project && project.data) {
        const data = project.data || {};
        const builder = data.builder
          ? data.builder
          : convertLegacyDataToBuilder(data);
        const zoom =
          typeof data.zoom === "number" && data.zoom > 0
            ? data.zoom
            : 1;

        const snapshot = {
          title: project.title || "My page",
          zoom,
          builder,
        };
        setState(snapshot);
        resetHistory(snapshot);
        lastSavedRef.current = JSON.stringify(snapshot);
        setSelection(null);
        setStatusMessage("Reloaded your latest saved page.");
      } else {
        const snapshot = {
          title: "My first page",
          zoom: 1,
          builder: createEmptyBuilder(),
        };
        setState(snapshot);
        resetHistory(snapshot);
        lastSavedRef.current = JSON.stringify(snapshot);
        setSelection(null);
        setStatusMessage(
          "No saved pages yet. Drag a Section to start."
        );
      }
    } catch (err) {
      console.error("reload error:", err);
      setLocalError(err.message || "Failed to reload your saved page.");
    }
  };

  // Builder operations
  const addRootSection = () => {
    const section = createSectionNode(null, "Section");
    updateBuilder((builder) => ({
      ...builder,
      rootSectionIds: [...builder.rootSectionIds, section.id],
      sections: {
        ...builder.sections,
        [section.id]: section,
      },
    }));
    setSelection({ kind: "section", id: section.id });
    return section;
  };

  const addChildSection = (parentSectionId) => {
    const section = createSectionNode(parentSectionId, "Child section");
    updateBuilder((builder) => {
      const parent = builder.sections[parentSectionId];
      if (!parent) return builder;
      return {
        ...builder,
        sections: {
          ...builder.sections,
          [section.id]: section,
          [parentSectionId]: {
            ...parent,
            children: [
              ...parent.children,
              { kind: "section", id: section.id },
            ],
          },
        },
      };
    });
    setSelection({ kind: "section", id: section.id });
  };

  const addBlockToSection = (sectionId, blockType) => {
    const newBlock = createBlockNode(blockType, sectionId);
    updateBuilder((builder) => {
      const section = builder.sections[sectionId];
      if (!section) return builder;

      return {
        ...builder,
        blocks: {
          ...builder.blocks,
          [newBlock.id]: newBlock,
        },
        sections: {
          ...builder.sections,
          [sectionId]: {
            ...section,
            children: [
              ...section.children,
              { kind: "block", id: newBlock.id },
            ],
          },
        },
      };
    });
    setSelection({ kind: "block", id: newBlock.id });
  };

  const deleteBlock = (blockId) => {
    updateBuilder((builder) => {
      const block = builder.blocks[blockId];
      if (!block) return builder;

      const parentId = block.parentId;
      const blocks = { ...builder.blocks };
      delete blocks[blockId];

      if (!parentId) return { ...builder, blocks };

      const parent = builder.sections[parentId];
      if (!parent) return { ...builder, blocks };

      const newChildren = parent.children.filter(
        (child) => !(child.kind === "block" && child.id === blockId)
      );

      return {
        ...builder,
        blocks,
        sections: {
          ...builder.sections,
          [parentId]: {
            ...parent,
            children: newChildren,
          },
        },
      };
    });

    if (selection?.kind === "block" && selection.id === blockId) {
      setSelection(null);
    }
  };

  const collectSectionDescendants = (sectionId, builder) => {
    const sectionIds = [sectionId];
    const blockIds = [];
    const section = builder.sections[sectionId];
    if (!section) return { sectionIds, blockIds };

    section.children.forEach((child) => {
      if (child.kind === "block") blockIds.push(child.id);
      else if (child.kind === "section") {
        const nested = collectSectionDescendants(child.id, builder);
        sectionIds.push(...nested.sectionIds);
        blockIds.push(...nested.blockIds);
      }
    });

    return { sectionIds, blockIds };
  };

  const deleteSection = (sectionId) => {
    updateBuilder((builder) => {
      const section = builder.sections[sectionId];
      if (!section) return builder;

      const { sectionIds, blockIds } = collectSectionDescendants(
        sectionId,
        builder
      );

      const sections = { ...builder.sections };
      const blocks = { ...builder.blocks };

      sectionIds.forEach((id) => delete sections[id]);
      blockIds.forEach((id) => delete blocks[id]);

      let rootSectionIds = builder.rootSectionIds.filter(
        (id) => !sectionIds.includes(id)
      );

      if (section.parentId) {
        const parent = sections[section.parentId];
        if (parent) {
          sections[section.parentId] = {
            ...parent,
            children: parent.children.filter(
              (child) =>
                !(
                  child.kind === "section" &&
                  sectionIds.includes(child.id)
                )
            ),
          };
        }
      }

      return {
        ...builder,
        sections,
        blocks,
        rootSectionIds,
      };
    });

    if (selection?.kind === "section" && selection.id === sectionId) {
      setSelection(null);
    }
  };

  const handleDeleteNode = ({ kind, id }) => {
    if (kind === "block") deleteBlock(id);
    else if (kind === "section") deleteSection(id);
  };

  const duplicateBlock = (blockId) => {
    updateBuilder((builder) => {
      const block = builder.blocks[blockId];
      if (!block) return builder;

      const parentId = block.parentId;
      const parent = builder.sections[parentId];
      if (!parent) return builder;

      const newBlock = {
        ...block,
        id: makeId("block"),
      };

      const children = [...parent.children];
      const index = children.findIndex(
        (child) => child.kind === "block" && child.id === blockId
      );

      if (index === -1) children.push({ kind: "block", id: newBlock.id });
      else
        children.splice(index + 1, 0, {
          kind: "block",
          id: newBlock.id,
        });

      return {
        ...builder,
        blocks: {
          ...builder.blocks,
          [newBlock.id]: newBlock,
        },
        sections: {
          ...builder.sections,
          [parentId]: {
            ...parent,
            children,
          },
        },
      };
    });
    setSelection({ kind: "block", id: blockId });
  };

  const isDescendant = (sectionId, candidateId, builder) => {
    if (sectionId === candidateId) return true;
    const section = builder.sections[sectionId];
    if (!section) return false;

    for (const child of section.children) {
      if (child.kind === "section") {
        if (child.id === candidateId) return true;
        if (isDescendant(child.id, candidateId, builder)) return true;
      }
    }
    return false;
  };

  const handleMoveExistingNode = ({ kind, id, targetSectionId }) => {
    updateBuilder((builder) => {
      if (kind === "block") {
        const block = builder.blocks[id];
        if (!block) return builder;

        if (!targetSectionId) {
          // Blocks must always live in a section
          return builder;
        }

        const oldParentId = block.parentId;
        const sections = { ...builder.sections };
        const blocks = { ...builder.blocks };

        const oldParent = sections[oldParentId];
        const newParent = sections[targetSectionId];
        if (!newParent) return builder;

        if (oldParent) {
          sections[oldParentId] = {
            ...oldParent,
            children: oldParent.children.filter(
              (child) => !(child.kind === "block" && child.id === id)
            ),
          };
        }

        sections[targetSectionId] = {
          ...newParent,
          children: [
            ...newParent.children,
            { kind: "block", id },
          ],
        };

        blocks[id] = {
          ...block,
          parentId: targetSectionId,
        };

        return {
          ...builder,
          sections,
          blocks,
        };
      }

      if (kind === "section") {
        const section = builder.sections[id];
        if (!section) return builder;

        if (
          targetSectionId &&
          isDescendant(id, targetSectionId, builder)
        ) {
          // can't drop section into its own child
          return builder;
        }

        const sections = { ...builder.sections };
        let rootSectionIds = [...builder.rootSectionIds];

        // remove from old parent / root
        if (section.parentId) {
          const parent = sections[section.parentId];
          if (parent) {
            sections[section.parentId] = {
              ...parent,
              children: parent.children.filter(
                (child) =>
                  !(child.kind === "section" && child.id === id)
              ),
            };
          }
        } else {
          rootSectionIds = rootSectionIds.filter((sid) => sid !== id);
        }

        // new location
        if (!targetSectionId) {
          // move to root
          rootSectionIds.push(id);
          sections[id] = {
            ...section,
            parentId: null,
          };
        } else {
          const newParent = sections[targetSectionId];
          if (!newParent) return builder;

          sections[targetSectionId] = {
            ...newParent,
            children: [
              ...newParent.children,
              { kind: "section", id },
            ],
          };
          sections[id] = {
            ...section,
            parentId: targetSectionId,
          };
        }

        return {
          ...builder,
          sections,
          rootSectionIds,
        };
      }

      return builder;
    });
  };

  const handleDropNewSection = (parentSectionId) => {
    if (!parentSectionId) addRootSection();
    else addChildSection(parentSectionId);
  };

  const handleDropNewBlock = (sectionId, blockType) => {
    if (!sectionId) return;
    addBlockToSection(sectionId, blockType);
  };

  const handleUpdateSection = (sectionId, updates) => {
    updateBuilder((builder) => {
      const section = builder.sections[sectionId];
      if (!section) return builder;

      const next = { ...section };

      if (updates.label !== undefined) next.label = updates.label;
      if (updates.settings) {
        next.settings = {
          ...(section.settings || createDefaultSectionSettings()),
          ...updates.settings,
        };
      }

      return {
        ...builder,
        sections: {
          ...builder.sections,
          [sectionId]: next,
        },
      };
    });
  };

  const handleUpdateBlock = (blockId, updates) => {
    updateBuilder((builder) => {
      const block = builder.blocks[blockId];
      if (!block) return builder;

      return {
        ...builder,
        blocks: {
          ...builder.blocks,
          [blockId]: {
            ...block,
            ...updates,
          },
        },
      };
    });
  };

  const handleZoomChange = (value) => {
    const clamped = Math.min(1.5, Math.max(0.5, value));
    setState((prev) => ({ ...prev, zoom: clamped }));
  };

  const handleClearAll = () => {
    const snapshot = {
      title: state.title,
      zoom: state.zoom,
      builder: createEmptyBuilder(),
    };
    setState(snapshot);
    resetHistory(snapshot);
    lastSavedRef.current = JSON.stringify(snapshot);
    setSelection(null);
    setStatusMessage("Page cleared. Start again by adding a Section.");
    setLocalError("");
  };

  const getDefaultTargetSectionId = () => {
    if (selection?.kind === "section") return selection.id;

    if (selection?.kind === "block") {
      const block = state.builder.blocks[selection.id];
      return block?.parentId || state.builder.rootSectionIds[0] || null;
    }

    return state.builder.rootSectionIds[0] || null;
  };

  const breadcrumb = useMemo(() => {
    if (!selection) return "Page";

    const builder = state.builder;

    const buildSectionChain = (sectionId) => {
      const names = [];
      let currentId = sectionId;
      while (currentId) {
        const s = builder.sections[currentId];
        if (!s) break;
        names.push(s.label || "Section");
        currentId = s.parentId;
      }
      return names.reverse();
    };

    if (selection.kind === "section") {
      const chain = buildSectionChain(selection.id);
      return ["Page", ...chain].join(" › ");
    }

    if (selection.kind === "block") {
      const block = builder.blocks[selection.id];
      if (!block) return "Page";
      const chain = buildSectionChain(block.parentId);
      return [
        "Page",
        ...chain,
        `Block: ${block.type || "block"}`,
      ].join(" › ");
    }

    return "Page";
  }, [selection, state.builder]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-sky-50 via-white to-amber-50 pt-16 pb-10">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 mb-2">
              <Sparkles className="w-4 h-4" />
              Kids Frontend Playground · Sections Builder
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Build your page with sections &amp; blocks
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Drag a Section into the canvas, then fill it with colourful
              Header, List, Button and Image blocks.
            </p>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-2 text-xs min-w-[260px]">
            <input
              type="text"

              value={state.title}
              onChange={(e) =>
                setState((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Page title"
              className="w-full text-black rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleReloadLatest}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                <RotateCw className="w-3 h-3 mr-1" />
                {loading ? "Loading..." : "Load latest"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!current?._id) {
                    toast.error("Save your page first!");
                    return;
                  }
                  const shareUrl = `${window.location.origin}/blocks/share/${current._id}`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.custom((t) => {
                    const user = JSON.parse(localStorage.getItem('sparvi_user') || '{}');

                    return (
                      <div
                        className={`
                        ${t.visible ? 'animate-enter' : 'animate-leave'}
                        max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden
                      `}
                      >
                        <div className="flex-1 w-0 p-4">
                          <div className="flex items-center">

                            {/* 1. Profile Photo (with fallback circle if no photo) */}
                            <div className="flex-shrink-0 pt-0.5">
                              <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-green-100"
                                src={user.photoUrl || "https://via.placeholder.com/40"} // Fallback image
                                alt={user.name}
                              />
                            </div>

                            <div className="ml-4 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900">Link Copied!</p>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  {user.name}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 truncate w-60 block">
                                {shareUrl}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex border-l border-gray-200">
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none"
                          >
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">✓</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  });
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-3 py-2 font-semibold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition"
              >
                Share Preview
              </button>

              <button
                type="button"
                onClick={handleManualSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-3 py-2 font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                <Save className="w-3 h-3 mr-1" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {(statusMessage || combinedError) && (
          <div className="mb-4 text-xs">
            {statusMessage && (
              <div className="mb-1 rounded-2xl bg-emerald-50 text-emerald-700 px-3 py-2 border border-emerald-100">
                {statusMessage}
              </div>
            )}
            {combinedError && (
              <div className="rounded-2xl bg-rose-50 text-rose-700 px-3 py-2 border border-rose-100">
                {combinedError}
              </div>
            )}
          </div>
        )}

        {/* Layout: toolbox | preview | right side */}
        <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,2.1fr)_260px] gap-4">
          {/* Left: toolbox */}
          <BlockToolbox
            onToolDragStart={setDragItem}
            onToolDragEnd={() => setDragItem(null)}
            onQuickAddSection={() => {
              if (selection?.kind === "section") {
                addChildSection(selection.id);
              } else {
                addRootSection();
              }
            }}
            onQuickAddBlock={(type) => {
              let targetSectionId = getDefaultTargetSectionId();
              if (targetSectionId) {
                addBlockToSection(targetSectionId, type);
              } else {
                const newSection = addRootSection();
                addBlockToSection(newSection.id, type);
              }
            }}
          />

          {/* Center: Canvas preview */}
          <BlockPreview
            builder={state.builder}
            selection={selection}
            onSelect={setSelection}
            dragItem={dragItem}
            setDragItem={setDragItem}
            onDropNewSection={handleDropNewSection}
            onDropNewBlock={handleDropNewBlock}
            onMoveExistingNode={handleMoveExistingNode}
            onAddChildSection={addChildSection}
            onDuplicateBlock={duplicateBlock}
            onDeleteNode={handleDeleteNode}
            zoom={state.zoom}
            breadcrumb={breadcrumb}
          />

          {/* Right: Tree + settings */}
          <div className="space-y-4">
            <div>
              <BlockCanvas
                builder={state.builder}
                selection={selection}
                onSelect={setSelection}
                onDeleteNode={handleDeleteNode}
                onAddChildSection={addChildSection}
                onDuplicateBlock={duplicateBlock}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-slate-500 hover:bg-slate-50 transition"
                >
                  Clear all sections &amp; blocks
                </button>
              </div>
              <BlockPropertiesPanel
                selection={selection}
                builder={state.builder}
                onChangeSection={handleUpdateSection}
                onChangeBlock={handleUpdateBlock}
                zoom={state.zoom}
                onZoomChange={handleZoomChange}
              />

            </div>
          </div>
        </div>

        {/* Clear all */}

      </div>
    </div>
  );
}
