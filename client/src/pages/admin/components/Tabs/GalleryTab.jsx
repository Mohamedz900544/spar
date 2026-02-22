import { motion } from 'framer-motion'
import { ImageIcon, Plus, Star } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa6'

export const GalleryTab = ({
    handleAddGalleryItem,
    newGalleryTitle,
    setNewGalleryTitle,
    galleryItems,
    handleGalleryPublishToggle,
    handleGalleryFeaturedToggle,
    setNewGalleryFile,
    newGalleryFile,
    isSendingGalleryImage
}) => {
    const MotionContainer = motion.div
    return (
        <MotionContainer
            key="gallery"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
            {/* Upload form */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-1">
                <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
                    Add new gallery item
                </h2>
                <form onSubmit={handleAddGalleryItem} className="space-y-3 flex flex-col gap-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
                            placeholder="e.g. Kids building WalkyBot"
                            value={newGalleryTitle}
                            onChange={(e) => setNewGalleryTitle(e.target.value)}
                        />
                    </div>
                    <div className='flex flex-col gap-4'>
                        <label htmlFor='image' className=" flex min-h-[150px] justify-center cursor-pointer  bg-blue-500 items-center flex-col gap-2 w-full text-xs rounded-xl hover:bg-blue-600 transition active:scale-90 text-white font-bold mb-1">
                            {newGalleryFile ? <div className='w-full h-full '><img className='w-full object-cover h-full rounded-lg' src={URL.createObjectURL(newGalleryFile)} alt="" /> </div> : <>
                                <ImageIcon className='w-[50px] h-[50px] text-white ' />
                                Upload Image
                            </>}
                            <input
                                type="file"
                                accept="image/*"
                                id='image'
                                onChange={(e) =>
                                    setNewGalleryFile(e.target.files[0])
                                }
                                className="w-full text-xs md:text-sm hidden"
                            />
                        </label>

                        <p className="text-[11px] text-slate-500 mt-1">
                            Selected photo will be uploaded to the server.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={isSendingGalleryImage}
                        className={`${isSendingGalleryImage ? 'bg-gray-500' : 'bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c]'} inline-flex items-center justify-center w-full gap-2 rounded-full  text-xs md:text-sm font-semibold text-slate-900 px-4 py-2 shadow-md hover:shadow-lg`}
                    >
                        <Plus className="w-4 h-4" />
                        Add to gallery (Draft)
                        {isSendingGalleryImage && <FaSpinner className='animate-spin' />}
                    </button>
                </form>
            </div>

            {/* Gallery list */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-2">
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
                                {g.fileName ?
                                    <img className='w-20 h-20 object-cover' src={`${import.meta.env.VITE_API_BASE_URL}/api/admin/gallery/${g.fileName}`} alt="" />
                                    :
                                    <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center relative">
                                        <ImageIcon className="w-5 h-5 text-[#102a5a]" />
                                        {g.featured && (
                                            <Star className="w-3 h-3 text-[#fbbf24] absolute -top-1 -right-1" />
                                        )}
                                    </div>
                                }

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
                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${g.status === "Published"
                                            ? "bg-[#dcfce7] text-[#166534]"
                                            : "bg-[#e5e7eb] text-[#374151]"
                                            }`}
                                    >
                                        {g.status}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleGalleryPublishToggle(g.id)
                                        }
                                        className="px-2 py-1 rounded-full border text-[10px] font-medium border-[#e2e8f0] text-[#102a5a] hover:bg-[#f1f5f9]"
                                    >
                                        {g.status === "Published"
                                            ? "Unpublish"
                                            : "Publish"}
                                    </button>
                                </div>
                                <button
                                    onClick={() =>
                                        handleGalleryFeaturedToggle(g.id)
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium ${g.featured
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
        </MotionContainer>
    )
}
