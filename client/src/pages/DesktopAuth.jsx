import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MonitorCheck } from "lucide-react";
import {
  buildDesktopAuthSearch,
  clearStoredAuth,
  completeDesktopAuth,
  getDesktopAuthParams,
} from "../helpers/desktopAuth";

const DesktopAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Sparvi Library...");
  const [error, setError] = useState("");
  const authParams = getDesktopAuthParams(searchParams);
  const { redirectUri, state } = authParams;

  useEffect(() => {
    const run = async () => {
      if (!redirectUri) {
        setError("Missing desktop redirect URI.");
        setStatus("");
        return;
      }

      const token = localStorage.getItem("sparvi_token");
      if (!token) {
        const nextSearch = buildDesktopAuthSearch({ redirectUri, state });
        navigate(`/login?${nextSearch}`, { replace: true });
        return;
      }

      try {
        await completeDesktopAuth({
          token,
          redirectUri,
          state,
        });
      } catch (err) {
        console.error("Desktop auth error:", err);
        if (err.status === 401 || err.status === 403) {
          clearStoredAuth();
          const nextSearch = buildDesktopAuthSearch({ redirectUri, state });
          navigate(`/login?${nextSearch}`, { replace: true });
          return;
        }
        setError(err.message || "Could not connect the desktop app.");
        setStatus("");
      }
    };

    run();
  }, [redirectUri, state, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102a5a]/10 text-[#102a5a]">
          <MonitorCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-[#102a5a]">Sparvi Library</h1>
        {status && <p className="mt-3 text-sm font-medium text-slate-500">{status}</p>}
        {error && (
          <>
            <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>
            <Link
              to={`/login?${buildDesktopAuthSearch(authParams)}`}
              className="mt-5 inline-flex rounded-xl bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#102a5a] transition-colors hover:bg-[#F59E0B]"
            >
              Sign in again
            </Link>
          </>
        )}
      </section>
    </main>
  );
};

export default DesktopAuth;
