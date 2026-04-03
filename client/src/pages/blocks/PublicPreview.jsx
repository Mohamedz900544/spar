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
      const padding = 24;
      const available = window.innerWidth - padding * 2;
      const rawScale = available > 0 ? available / desktopWidth : 1;
      const nextScale = Math.min(1, Math.max(0.3, rawScale));
      setPreviewScale(Number.isFinite(nextScale) ? nextScale : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (!data) return <div className="p-10 text-center">Loading preview...</div>;

  const headerData = {
    ...(data.user || {}),
    name: data.childName || data.user?.name || "Shared page",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 overflow-x-hidden">
      <BlockHeader data={headerData} />
      <h1 className="text-xl font-bold text-center mb-4">
        {data.title}
      </h1>

      <div className="w-full mx-auto bg-white rounded-3xl p-4 shadow overflow-hidden">
        <div className="flex justify-center overflow-hidden">
          <div
            style={{
              width: `${Math.round(desktopWidth * previewScale)}px`,
            }}
          >
            <div
              className="origin-top-left"
              style={{
                width: `${desktopWidth}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <BlockPreview
                builder={data.builder}
                selection={null}
                dragItem={null}
                setDragItem={() => { }}
                zoom={1}
                frame={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
