/**
 * EgyptPhoneInput
 * ─────────────────────────────────────────────────────────────
 * A styled phone input for Egyptian mobile numbers.
 *
 * Formats as:  0XXX XXX XXXX  (11 digits)
 * Valid prefixes: 010 · 011 · 012 · 015
 *
 * Props:
 *   value      – controlled value (the formatted string)
 *   onChange   – called with (formattedString)
 *   error      – error message string (shows red state)
 *   inputClass – override/extend base input class
 *   ...rest    – forwarded to <input> (name, required, etc.)
 */

/** Strip non-digits and cap at 11 */
const digitsOnly = (v) => (v || "").replace(/\D/g, "").slice(0, 11);

/** Format 11-digit string → "0XXX XXX XXXX" */
const formatEgyptPhone = (raw) => {
    const d = digitsOnly(raw);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
};

/** True when the number is a valid Egyptian mobile */
const isValidEgyptPhone = (v) => {
    const d = digitsOnly(v);
    return /^(010|011|012|015)\d{8}$/.test(d);
};

const EgyptPhoneInput = ({
    value = "",
    onChange,
    error,
    inputClass = "",
    ...rest
}) => {
    const formatted = formatEgyptPhone(value);
    const touched = digitsOnly(value).length > 0;
    const valid = isValidEgyptPhone(value);

    const handleChange = (e) => {
        const next = formatEgyptPhone(e.target.value);
        onChange(next);
    };

    /* Border colour based on state */
    const borderClass = error
        ? "border-red-400 focus:ring-red-300/40 focus:border-red-400"
        : touched && valid
            ? "border-green-400 focus:ring-green-300/40 focus:border-green-400"
            : "border-slate-200 focus:ring-[#FBBF24]/40 focus:border-[#FBBF24]";

    return (
        <div className="w-full">
        <div className="relative flex items-stretch min-w-0">
                {/* ── Flag + code badge ── */}
                <div className="flex items-center gap-1.5 px-3.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-2xl text-slate-600 shrink-0 select-none">
                    <span className="text-xl leading-none" role="img" aria-label="Egypt">🇪🇬</span>
                    <span className="text-sm font-semibold text-slate-700">+20</span>
                </div>

                {/* ── Number input ── */}
                <input
                    type="tel"
                    inputMode="numeric"
                    value={formatted}
                    onChange={handleChange}
                    placeholder="0100 123 4567"
                    autoComplete="tel"
                    className={[
                        "flex-1 min-w-0 py-3.5 px-4 rounded-r-2xl border bg-slate-50/50 text-sm text-slate-800",
                        "outline-none focus:ring-2 transition-all placeholder:text-slate-400",
                        borderClass,
                        inputClass,
                    ].join(" ")}
                    {...rest}
                />

                {/* ── Live valid indicator ── */}
                {touched && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                        {valid ? "✅" : ""}
                    </span>
                )}
            </div>

            {/* ── Hint / error line ── */}
            <p className={`text-xs mt-1.5 ml-1 ${error ? "text-red-500" : "text-slate-400"}`}>
                {error
                    ? error
                    : ""}
            </p>
        </div>
    );
};

export default EgyptPhoneInput;
