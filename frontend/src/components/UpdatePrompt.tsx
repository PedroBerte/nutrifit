// UpdatePrompt.tsx
import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // dispare um evento global ou use um state gerenciado
    window.dispatchEvent(new Event("pwa:need-refresh"));
  },
  onOfflineReady() {
    window.dispatchEvent(new Event("pwa:offline-ready"));
  },
});

export function UpdatePrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onNeed = () => setOpen(true);
    window.addEventListener("pwa:need-refresh", onNeed);
    return () => window.removeEventListener("pwa:need-refresh", onNeed);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl shadow-lg px-4 py-3 bg-black/80 text-white flex gap-3 items-center">
      <span>Nova versão disponível.</span>
      <button
        className="px-3 py-1 rounded bg-white text-black"
        onClick={() => updateSW()}
      >
        Atualizar
      </button>
      <button
        className="px-3 py-1 rounded border border-white/40"
        onClick={() => setOpen(false)}
      >
        Depois
      </button>
    </div>
  );
}
