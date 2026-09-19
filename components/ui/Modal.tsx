"use client";

import { HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";
import {
  cloneElement,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  isValidElement,
  Fragment,
  type ReactElement,
  type ReactNode,
} from "react";
import useOutsideClick from "@/hooks/useOutsideClick";

interface ModalContextType {
  openName: string;
  open: (name: string) => void;
  close: () => void;
}

interface OpenProps {
  children: ReactElement<{ onClick?: () => void }>;
  opens: string;
}

interface WindowProps {
  children: ReactNode;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  onClose?: () => void;
}

interface DirectModalProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const ModalContext = createContext<ModalContextType | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  return context;
}

function Modal({
  children,
  isOpen,
  onClose,
  title,
  size = "lg",
}: DirectModalProps) {
  const [openName, setOpenName] = useState("");

  const close = () => {
    setOpenName("");
    onClose?.();
  };
  const open = (name: string) => setOpenName(name);

  // If used in direct controlled mode (<Modal isOpen={true} onClose={...}>)
  if (isOpen !== undefined) {
    if (!isOpen) return null;
    return (
      <Window onClose={close} size={size} title={title}>
        {children}
      </Window>
    );
  }

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens }: OpenProps) {
  const ctx = useModalContext();

  return cloneElement(children, {
    onClick: () => ctx?.open(opens),
  });
}

const windowSizes = {
  sm: "max-w-[min(96vw,36rem)] p-4 sm:p-6",
  md: "max-w-[min(96vw,56rem)] p-4 sm:p-8",
  lg: "max-w-[min(98vw,72rem)] p-4 sm:p-8 md:p-10",
  xl: "max-w-[min(98vw,90rem)] p-4 sm:p-8 md:p-10",
};

function Window({ children, name, size = "lg", title, onClose }: WindowProps) {
  const ctx = useModalContext();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (ctx) {
      ctx.close();
    }
  }, [onClose, ctx]);

  const ref = useOutsideClick<HTMLDivElement>(handleClose);

  const isVisible = name ? ctx?.openName === name : true;

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isVisible, handleClose]);

  if (!isVisible) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        bg-black/70
        p-2.5 sm:p-6
        backdrop-blur-md
        animate-fadeIn
      "
    >
      <div
        ref={ref}
        className={`
          relative w-full
          max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100vh-3rem)]
          flex flex-col

          rounded-2xl sm:rounded-[2rem]
          border border-border
          bg-[#0c1222]/95 dark:bg-[#0c1222]/95
          shadow-glass
          backdrop-blur-2xl

          transition-all duration-300

          before:pointer-events-none
          before:absolute
          before:inset-0
          before:rounded-2xl sm:before:rounded-[2rem]
          before:border
          before:border-white/10

          after:pointer-events-none
          after:absolute
          after:inset-0
          after:rounded-2xl sm:after:rounded-[2rem]
          after:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]

          ${windowSizes[size]}
        `}
      >
        <div
          className="
            pointer-events-none
            absolute inset-x-0 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-primary-light/40
            to-transparent
          "
        />

        {title && (
          <div className="mb-4 pr-12">
            <h2 className="text-lg sm:text-xl font-semibold metal-text truncate">
              {title}
            </h2>
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng"
          className="
            absolute right-3 top-3 sm:right-4 sm:top-4 z-30
            flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center

            rounded-xl sm:rounded-2xl
            border border-border
            bg-card

            text-muted
            backdrop-blur-xl

            transition-all duration-200

            cursor-pointer
            hover:border-primary-light/40
            hover:bg-card-hover
            hover:text-foreground
            hover:shadow-[0_0_20px_rgba(21,174,245,0.15)]
            active:scale-95

            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light
          "
        >
          <HiXMark className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {isValidElement(children) &&
          typeof children.type !== "string" &&
          children.type !== Fragment
            ? cloneElement(
                children as ReactElement<{ onCloseModal?: () => void }>,
                {
                  onCloseModal: handleClose,
                }
              )
            : children}
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;