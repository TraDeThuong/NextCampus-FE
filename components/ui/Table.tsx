"use client";

import { createContext, useContext, type JSX, type ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { useLocale } from "next-intl";

type TableContextType = {
  columns: string;
};

const TableContext = createContext<TableContextType | undefined>(undefined);

function useTableContext() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("Table components must be used inside <Table>");
  }

  return context;
}

type TableProps = {
  columns: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

type HeaderProps = {
  children: ReactNode;
  className?: string;
  isSticky?: boolean;
};

type RowProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

type BodyProps<T> = {
  data?: T[];
  render: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

type ReloadButtonProps = {
  onReload: () => void;
  isReloading?: boolean;
  title?: string;
  className?: string;
};

type CompoundTable = {
  ({ columns, children }: TableProps): JSX.Element;
  Header: ({ children }: HeaderProps) => JSX.Element;
  Row: ({ children }: RowProps) => JSX.Element;
  Body: <T>({ data, render }: BodyProps<T>) => JSX.Element;
  Footer: ({
    children,
  }: {
    children?: ReactNode;
    className?: string;
  }) => JSX.Element | null;
  ReloadButton: ({
    onReload,
    isReloading,
    title,
    className,
  }: ReloadButtonProps) => JSX.Element;
};

const Table: CompoundTable = function Table({
  columns,
  children,
  className = "",
  containerClassName = "",
}: TableProps) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div
        className={`
          w-full min-w-0 max-w-full overflow-x-auto pb-2
          [scrollbar-color:rgba(255,255,255,0.14)_transparent]
          [scrollbar-width:thin]
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/15
          [&::-webkit-scrollbar-track]:bg-transparent
          ${containerClassName}
        `}
      >
        <div
          role="table"
          className={`
            w-fit min-w-full
            rounded-3xl
            border border-border
            bg-card
            shadow-glass
            backdrop-blur-xl
            overflow-hidden
            ${className}
          `}
        >
          {children}
        </div>
      </div>
    </TableContext.Provider>
  );
};

function Header({ children, className = "", isSticky = true }: HeaderProps) {
  const { columns } = useTableContext();

  return (
    <header
      role="row"
      style={{ gridTemplateColumns: columns }}
      className={`
        grid items-center gap-x-4 md:gap-x-6
        border-b border-slate-200 dark:border-white/10
        bg-slate-50/80 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)]
        px-4 md:px-6 py-4
        text-xs font-bold uppercase tracking-[0.12em]
        text-primary-main dark:text-primary-light
        backdrop-blur-xl
        rounded-t-[23px]
        [&>*]:min-w-0
        ${isSticky ? "sticky top-0 z-10 bg-card/95" : ""}
        ${className}
      `}
    >
      {children}
    </header>
  );
}

function Row({ children, className = "", onClick }: RowProps) {
  const { columns } = useTableContext();

  return (
    <div
      role="row"
      style={{ gridTemplateColumns: columns }}
      onClick={onClick}
      className={`
        grid items-center gap-x-4 md:gap-x-6
        border-b border-slate-100 dark:border-white/5
        px-4 md:px-6 py-4
        text-foreground
        transition-all duration-200
        hover:bg-slate-50/80 dark:hover:bg-white/[0.04]
        last:border-b-0
        [&>*]:min-w-0
        ${onClick ? "cursor-pointer active:bg-slate-100/80 dark:active:bg-white/[0.06]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function Body<T>({
  data = [],
  render,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = "Chưa có dữ liệu hiển thị",
  emptyDescription = "Các bản ghi mới sẽ xuất hiện tại đây khi được tạo.",
  emptyAction,
}: BodyProps<T>) {
  const { columns } = useTableContext();

  if (isLoading) {
    const colCount = Math.max(1, columns.split(" ").length);
    return (
      <section className="divide-y divide-white/5 animate-pulse">
        {Array.from({ length: skeletonRows }).map((_, rIdx) => (
          <div
            key={`table-skel-row-${rIdx}`}
            style={{ gridTemplateColumns: columns }}
            className="grid items-center gap-x-4 md:gap-x-6 px-4 md:px-6 py-4"
          >
            {Array.from({ length: colCount }).map((_, cIdx) => (
              <div
                key={`table-skel-cell-${rIdx}-${cIdx}`}
                className={`h-4 rounded-md bg-slate-200/80 dark:bg-white/10 ${
                  cIdx === 0
                    ? "w-3/4"
                    : cIdx % 2 === 0
                    ? "w-1/2"
                    : cIdx % 3 === 0
                    ? "w-2/3"
                    : "w-1/3"
                }`}
              />
            ))}
          </div>
        ))}
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="px-8 py-16 text-center flex flex-col items-center justify-center">
        <p className="text-base sm:text-lg font-medium text-primary-light">
          {emptyMessage}
        </p>

        {emptyDescription && (
          <p className="mt-1.5 text-xs sm:text-sm text-muted max-w-sm">
            {emptyDescription}
          </p>
        )}

        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return <section>{data.map(render)}</section>;
}

function Footer({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <footer
      className={`
        flex items-center justify-between
        border-t border-slate-100 dark:border-white/5
        bg-slate-50/50 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_100%)]
        px-6 py-4
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </footer>
  );
}

export function TableReloadButton({
  onReload,
  isReloading = false,
  title,
  className = "",
}: ReloadButtonProps) {
  const locale = useLocale();
  const defaultTitle =
    title ?? (locale === "vi" ? "Làm mới dữ liệu" : "Refresh data");

  return (
    <div className={`flex items-center justify-end ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReload();
        }}
        disabled={isReloading}
        title={defaultTitle}
        aria-label={defaultTitle}
        className="
          flex h-7 w-7 items-center justify-center
          rounded-lg border border-transparent
          text-muted transition-all duration-200
          hover:border-border dark:hover:border-white/10
          hover:bg-slate-100 dark:hover:bg-white/5
          hover:text-primary-main dark:hover:text-cyan-400
          active:scale-90
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <RotateCw
          className={`h-3.5 w-3.5 transition-transform ${
            isReloading ? "animate-spin text-primary-main dark:text-cyan-400" : ""
          }`}
        />
      </button>
    </div>
  );
}

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;
Table.Footer = Footer;
Table.ReloadButton = TableReloadButton;

export default Table;
