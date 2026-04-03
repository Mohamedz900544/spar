import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import BlockPreview from "../../components/blocks/BlockPreview";
import { BlockHeader } from "../../components/blocks/BlockHeader";

export default function PublicPreview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const desktopWidth = 1024;

  useEffect(() => {
    // setUserData(JSON.parse(localStorage.getItem('sparvi_user')))
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blocks/share/${id}`, {
      method: "GET",
      credentials: "omit",
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    const updateScale = () => {
      const padding = 32;
      const available = window.innerWidth - padding * 2;
      const nextScale =
        available > 0 ? Math.min(1, available / desktopWidth) : 1;
      setPreviewScale(Number.isFinite(nextScale) ? nextScale : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (!data) return <div className="p-10 text-center">Loading preview...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <BlockHeader data={data.user} />
      <h1 className="text-xl font-bold text-center mb-4">
        {data.title}
      </h1>

      <div className="w-full mx-auto bg-white rounded-3xl p-4 shadow overflow-hidden">
        <div
          className="origin-top-left"
          style={{
            width: `${desktopWidth}px`,
            transform: `scale(${previewScale})`,
          }}
        >
          <BlockPreview
            builder={data.builder}
            selection={null}
            dragItem={null}
            setDragItem={() => { }}
            zoom={data.zoom}
          />
        </div>
      </div>
    </div>
  );
}
