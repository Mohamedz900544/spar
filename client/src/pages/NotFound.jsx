import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <Link to="/">
        <button className="btn-primary px-6 py-2 text-lg">
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
