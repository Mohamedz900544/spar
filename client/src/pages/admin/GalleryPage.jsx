// src/pages/GalleryPage.jsx
import React from "react";
import { Image as ImageIcon, Plus, Star } from "lucide-react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

const GalleryPage = () => {
  const {
    isLoading,
    loadError,
    galleryItems,
    newGalleryTitle,
    setNewGalleryTitle,
    setNewGalleryFile,
    handleAddGalleryItem,
    handleGalleryPublishToggle,
    handleGalleryFeaturedToggle,
  } = useAdminDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      <header className="bg-[#0b63c7] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold leading-tight">
            Gallery
          </h1>
          {isLoading && (
            <p className="text-[11px] text-blue-100 mt-0.5">
              Loading gallery…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ImageIcon className="w-4 h-4" />
          <span>Photos & memories</span>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-10 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm text-red-700">
              {loadError}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Upload form */}
            <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-1">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
                Add new gallery item
              </h2>
              <form onSubmit={handleAddGalleryItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                    placeholder="e.g. Kids building WalkyBot"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewGalleryFile(e.target.files[0])}
                    className="w-full text-xs md:text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Selected photo will be uploaded to the server.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center w-full gap-2 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c] text-xs md:text-sm font-semibold text-slate-900 px-4 py-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add to gallery (Draft)
                </button>
              </form>
            </div>

            {/* Gallery list */}
            <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm md:text-base font-semibold text-slate-900">
                  Gallery items
                </h2>
                <span className="text-[11px] text-slate-500">
                  {galleryItems.length} items
                </span>
              </div>
              <div className="space-y-3">
                {galleryItems.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center relative">
                        <ImageIcon className="w-5 h-5 text-[#0b63c7]" />
                        {g.featured && (
                          <Star className="w-3 h-3 text-[#fbbf24] absolute -top-1 -right-1" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {g.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {g.date}
                          {g.fileName && ` · ${g.fileName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            g.status === "Published"
                              ? "bg-[#dcfce7] text-[#166534]"
                              : "bg-[#e5e7eb] text-[#374151]"
                          }`}
                        >
                          {g.status}
                        </span>
                        <button
                          onClick={() => handleGalleryPublishToggle(g.id)}
                          className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#dbeafe] text-[#0b63c7] hover:bg-[#eff6ff]"
                        >
                          {g.status === "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                      </div>
                      <button
                        onClick={() => handleGalleryFeaturedToggle(g.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium ${
                          g.featured
                            ? "border-[#fbbf24] text-[#92400e] bg-[#fef3c7]"
                            : "border-[#e5e7eb] text-slate-600 hover:bg-[#f9fafb]"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {g.featured ? "Featured" : "Set featured"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default GalleryPage;
