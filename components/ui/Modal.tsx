import { HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";
import {
  cloneElement,
  createContext,
  useContext,
  useState,
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
  children: ReactElement<{ onCloseModal?: () => void }>;
  name: string;
  size?: "sm" | "md" | "lg";
}

const ModalContext = createContext<ModalContextType | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal components must be used inside <Modal>");
  }

  return context;
}

function Modal({ children }: { children: ReactNode }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = (name: string) => setOpenName(name);

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens }: OpenProps) {
  const { open } = useModalContext();

  return cloneElement(children, {
    onClick: () => open(opens),
  });
}

const windowSizes = {
  sm: "max-w-[min(92vw,42rem)] p-5 sm:p-6",
  md: "max-w-[min(94vw,72rem)] p-6 sm:p-8",
  lg: "max-w-[min(96vw,112rem)] p-6 sm:p-10",
};

function Window({ children, name, size = "lg" }: WindowProps) {
  const { openName, close } = useModalContext();

  const ref = useOutsideClick<HTMLDivElement>(close);

  if (name !== openName) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        bg-black/70
        p-4
        backdrop-blur-md
        animate-in fade-in duration-300
      "
    >
      <div
        ref={ref}
        className={`
          relative w-full
          max-h-[calc(100vh-3rem)]
          overflow-y-auto overflow-x-hidden

          rounded-[2rem]
          border border-border
          bg-card
          shadow-glass
          backdrop-blur-2xl

          transition-all duration-300

          before:pointer-events-none
          before:absolute
          before:inset-0
          before:rounded-[2rem]
          before:border
          before:border-white/10

          after:pointer-events-none
          after:absolute
          after:inset-0
          after:rounded-[2rem]
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

        <button
          onClick={close}
          className="
            absolute right-4 top-4
            flex h-12 w-12 items-center justify-center

            rounded-2xl
            border border-border
            bg-card

            text-muted
            backdrop-blur-xl

            transition-all duration-200

            hover:cursor-pointer
            hover:border-primary-light/40
            hover:bg-card-hover
            hover:text-foreground
            hover:shadow-[0_0_20px_rgba(21,174,245,0.15)]

            focus:outline-none
          "
        >
          <HiXMark className="h-7 w-7 hover:cursor-pointer" />
        </button>

        <div>
          {cloneElement(children, {
            onCloseModal: close,
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;