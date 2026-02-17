// src/components/blocks/BlockPropertiesPanel.jsx

/**
 * selection = { kind: "section"|"block", id: string } | null
 * builder = { sections, blocks, ... }
 */
export default function BlockPropertiesPanel({
  selection,
  builder,
  onChangeSection,
  onChangeBlock,
  zoom,
  onZoomChange,
}) {
  const handleZoomInput = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    const clamped = Math.min(150, Math.max(50, numeric));
    onZoomChange?.(clamped / 100);
  };

  // No selection -> page-level
  if (!selection) {
    return (
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Page settings
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Change zoom and general feel of the canvas. Select a section or
          block to edit its details.
        </p>

        <div className="space-y-3 text-[12px]">
          <div>
            <label className="block text-slate-600 mb-1">Zoom</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={150}
                value={Math.round((zoom || 1) * 100)}
                onChange={(e) => handleZoomInput(e.target.value)}
                className="flex-1"
              />
              <span className="w-12 text-right text-xs text-slate-600">
                {Math.round((zoom || 1) * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Zoom makes everything bigger or smaller without changing the
              real sizes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SECTION SETTINGS
  if (selection.kind === "section") {
    const section = builder.sections[selection.id];
    if (!section) return null;

    const settings = section.settings || {};

    const updateSectionField = (field, value) => {
      onChangeSection?.(section.id, { [field]: value });
    };

    const updateSettingsField = (field, value) => {
      onChangeSection?.(section.id, {
        settings: { ...settings, [field]: value },
      });
    };

    return (
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Section settings
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Change how this section looks: size, padding, background and
          columns.
        </p>

        <div className="space-y-3 text-[12px]">
          <div>
            <label className="block text-slate-600 mb-1">Section name</label>
            <input
              type="text"
              value={section.label || ""}
              onChange={(e) =>
                updateSectionField("label", e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              placeholder="Hero section, Gallery, Footer..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">Width</label>
              <input
                type="text"
                value={settings.width || "100%"}
                onChange={(e) =>
                  updateSettingsField("width", e.target.value || "100%")
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="e.g. 100% or 900px"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Height</label>
              <input
                type="text"
                value={settings.height || "auto"}
                onChange={(e) =>
                  updateSettingsField("height", e.target.value || "auto")
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="e.g. auto or 400px"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={settings.padding ?? 24}
                onChange={(e) =>
                  updateSettingsField(
                    "padding",
                    Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Margin (px)
              </label>
              <input
                type="number"
                value={settings.margin ?? 12}
                onChange={(e) =>
                  updateSettingsField(
                    "margin",
                    Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Background color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    updateSettingsField("backgroundColor", e.target.value)
                  }
                  className="h-8 w-8 rounded-full border border-slate-200"
                />
                <input
                  type="text"
                  value={settings.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    updateSettingsField("backgroundColor", e.target.value)
                  }
                  className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Background image URL
              </label>
              <input
                type="text"
                value={settings.backgroundImage || ""}
                onChange={(e) =>
                  updateSettingsField("backgroundImage", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Border radius (px)
              </label>
              <input
                type="number"
                value={settings.borderRadius ?? 20}
                onChange={(e) =>
                  updateSettingsField(
                    "borderRadius",
                    Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Border width (px)
              </label>
              <input
                type="number"
                value={settings.borderWidth ?? 0}
                onChange={(e) =>
                  updateSettingsField(
                    "borderWidth",
                    Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Columns inside this section
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => updateSettingsField("columns", col)}
                  className={`flex-1 rounded-2xl border px-2 py-1.5 text-[11px] font-semibold ${
                    (settings.columns ?? 1) === col
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {col} {col === 1 ? "column" : "columns"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Blocks and child sections will snap to this grid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // BLOCK SETTINGS
  if (selection.kind === "block") {
    const block = builder.blocks[selection.id];
    if (!block) return null;

    const updateField = (field, value) => {
      onChangeBlock?.(block.id, { [field]: value });
    };

    const listText = Array.isArray(block.items)
      ? block.items.join("\n")
      : block.text || "";

    return (
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-3">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Block settings
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          You are editing:{" "}
          <span className="font-semibold">{block.type}</span>
        </p>

        <div className="space-y-3 text-[12px]">
          {/* Text-based blocks */}
          {["header", "footer", "heading", "paragraph"].includes(
            block.type
          ) && (
            <div>
              <label className="block text-slate-600 mb-1">
                {block.type === "header"
                  ? "Header text"
                  : block.type === "footer"
                  ? "Footer text"
                  : block.type === "heading"
                  ? "Heading text"
                  : "Paragraph text"}
              </label>
              <textarea
                rows={block.type === "paragraph" ? 3 : 2}
                value={block.text || ""}
                onChange={(e) => updateField("text", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          )}

          {/* List block */}
          {block.type === "list" && (
            <div>
              <label className="block text-slate-600 mb-1">
                List items (one per line)
              </label>
              <textarea
                rows={4}
                value={listText}
                onChange={(e) =>
                  updateField(
                    "items",
                    e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          )}

          {/* Button block */}
          {block.type === "button" && (
            <>
              <div>
                <label className="block text-slate-600 mb-1">
                  Button text
                </label>
                <input
                  type="text"
                  value={block.text || ""}
                  onChange={(e) => updateField("text", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Style</label>
                <select
                  value={block.variant || "primary"}
                  onChange={(e) =>
                    updateField("variant", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
                >
                  <option value="primary">Primary (blue)</option>
                  <option value="outline">Outline</option>
                  <option value="soft">Soft</option>
                </select>
              </div>
            </>
          )}

          {/* Image block */}
          {block.type === "image" && (
            <>
              <div>
                <label className="block text-slate-600 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={block.src || ""}
                  onChange={(e) => updateField("src", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Alt text
                </label>
                <input
                  type="text"
                  value={block.alt || ""}
                  onChange={(e) => updateField("alt", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id={`rounded-${block.id}`}
                  type="checkbox"
                  checked={block.rounded ?? true}
                  onChange={(e) =>
                    updateField("rounded", e.target.checked)
                  }
                />
                <label
                  htmlFor={`rounded-${block.id}`}
                  className="text-slate-600 text-[11px]"
                >
                  Rounded corners
                </label>
              </div>
            </>
          )}

          {/* Input block (single text input / form field) */}
          {block.type === "input" && (
            <>
              <div>
                <label className="block text-slate-600 mb-1">
                  Input label
                </label>
                <input
                  type="text"
                  value={block.label || ""}
                  onChange={(e) => updateField("label", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="Your name, Email, etc."
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={block.placeholder || ""}
                  onChange={(e) =>
                    updateField("placeholder", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="Type here..."
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Input type
                </label>
                <select
                  value={block.inputType || "text"}
                  onChange={(e) =>
                    updateField("inputType", e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="password">Password</option>
                </select>
              </div>
            </>
          )}

          {/* Icons block (using <i> tags) */}
          {block.type === "icons" && (
            <div>
              <label className="block text-slate-600 mb-1">
                Icons HTML (&lt;i&gt; tags)
              </label>
              <textarea
                rows={3}
                value={block.icons || ""}
                onChange={(e) => updateField("icons", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Example: &lt;i class="fa-solid fa-star"&gt;&lt;/i&gt;
              </p>
            </div>
          )}

          {/* Generic block style (all types) */}
          <div className="border-t border-slate-100 pt-2 mt-1" />

          <div>
            <label className="block text-slate-600 mb-1">
              Text color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.textColor || "#0f172a"}
                onChange={(e) =>
                  updateField("textColor", e.target.value)
                }
                className="h-8 w-8 rounded-full border border-slate-200"
              />
              <input
                type="text"
                value={block.textColor || "#0f172a"}
                onChange={(e) =>
                  updateField("textColor", e.target.value)
                }
                className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Background color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateField("backgroundColor", e.target.value)
                }
                className="h-8 w-8 rounded-full border border-slate-200"
              />
              <input
                type="text"
                value={block.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  updateField("backgroundColor", e.target.value)
                }
                className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          {/* NEW: padding + margin per block */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={block.padding ?? ""}
                onChange={(e) =>
                  updateField(
                    "padding",
                    e.target.value === ""
                      ? null
                      : Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Leave empty for default"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">
                Margin (px)
              </label>
              <input
                type="number"
                value={block.margin ?? ""}
                onChange={(e) =>
                  updateField(
                    "margin",
                    e.target.value === ""
                      ? null
                      : Number(e.target.value) || 0
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Leave empty for default"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Font size (px)
            </label>
            <input
              type="number"
              min={8}
              max={64}
              value={block.fontSize ?? ""}
              onChange={(e) =>
                updateField(
                  "fontSize",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value) || null
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              placeholder="Leave empty for default size"
            />
          </div>

          {/* Layout within section */}
          <div>
            <label className="block text-slate-600 mb-1">
              Width span (columns)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((span) => (
                <button
                  key={span}
                  type="button"
                  onClick={() => updateField("widthSpan", span)}
                  className={`flex-1 rounded-2xl border px-2 py-1.5 text-[11px] font-semibold ${
                    (block.widthSpan || 1) === span
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {span}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">
              Minimum height (px)
            </label>
            <input
              type="number"
              min={0}
              value={block.minHeight ?? ""}
              onChange={(e) =>
                updateField(
                  "minHeight",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value) || null
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              placeholder="Leave empty for auto height"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Alignment</label>
            <div className="flex gap-1">
              {["left", "center", "right"].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => updateField("align", pos)}
                  className={`flex-1 rounded-2xl border px-2 py-1.5 text-[11px] font-semibold capitalize ${
                    block.align === pos
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
