import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#e8efff] to-white flex flex-col items-center justify-center text-center p-6">
      <div className="text-8xl mb-4">🤖</div>
      <h1 className="text-6xl font-bold text-[#102a5a] mb-4 font-display">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Sorry, the page you&apos;re looking for doesn&apos;t exist.
        It might have been moved or the URL may be incorrect.
      </p>
      <Link to="/">
        <button className="rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
