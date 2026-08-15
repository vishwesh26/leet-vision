import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function EzoicRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.ezstandalone = window.ezstandalone || {};
      window.ezstandalone.cmd = window.ezstandalone.cmd || [];

      window.ezstandalone.cmd.push(() => {
        if (typeof window.ezstandalone.showAds === "function") {
          window.ezstandalone.showAds();
        }
      });
    } catch (e) {
      console.warn("Ezoic route handler error:", e);
    }
  }, [location.pathname, location.search]);

  return null;
}
