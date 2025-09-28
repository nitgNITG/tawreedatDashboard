import { useEffect, useRef } from "react";

function useClickOutside(close: () => void, open?: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) {
        if (open) {
          document.body.style.overflowY = "auto";
        }
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]); // ✅ Include `open` in dependencies

  return ref;
}

export default useClickOutside;
