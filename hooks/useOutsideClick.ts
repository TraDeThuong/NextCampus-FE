import { useEffect, useRef } from "react";

export default function useOutsideClick<T extends HTMLElement>(
  handler: () => void,
  listenCapturing = true
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      // Bỏ qua click vào portal elements (vd: DatePicker calendar) - chúng nằm ngoài DOM tree của ref
      if ((target as HTMLElement).closest?.('[data-portal]')) return;
      if (
        ref.current &&
        !ref.current.contains(target)
      ) {
        handler();
      }
    }

    document.addEventListener(
      "click",
      handleClick,
      listenCapturing
    );

    return () =>
      document.removeEventListener(
        "click",
        handleClick,
        listenCapturing
      );
  }, [handler, listenCapturing]);

  return ref;
}