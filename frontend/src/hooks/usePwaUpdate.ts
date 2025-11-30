// usePwaUpdate.ts
import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateFn, setUpdateFn] = useState<
    null | ((reloadPage?: boolean) => void)
  >(null);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log("App pronto para uso offline");
      },
    });

    setUpdateFn(() => updateSW);
  }, []);

  const doUpdate = () => {
    if (updateFn) {
      updateFn(true);
    }
  };

  return { needRefresh, doUpdate, dismiss: () => setNeedRefresh(false) };
}
