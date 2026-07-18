import { createContext, useContext, type JSX, type ReactNode } from "react";

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
};

type HeaderProps = {
  children: ReactNode;
};

type RowProps = {
  children: ReactNode;
};

type BodyProps<T> = {
  data?: T[];
  render: (item: T) => ReactNode;
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
  }) => JSX.Element | null;
};

const Table: CompoundTable = function Table({
  columns,
  children,
  className = "",
}: TableProps) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div
        role="table"
        className={`
          rounded-3xl
          border border-border
          bg-card
          shadow-glass
          backdrop-blur-xl
          ${className}
        `}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
};

function Header({ children }: HeaderProps) {
  const { columns } = useTableContext();

  return (
    <header
      role="row"
      style={{ gridTemplateColumns: columns }}
      className="
        grid items-center gap-x-8
        border-b border-white/10
        bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)]
        px-8 py-4
        text-xs font-semibold uppercase tracking-[0.15em]
        text-[var(--primary-light)]
        backdrop-blur-xl
        rounded-t-[23px]
      "
    >
      {children}
    </header>
  );
}

function Row({ children }: RowProps) {
  const { columns } = useTableContext();

  return (
    <div
      role="row"
      style={{ gridTemplateColumns: columns }}
      className="
        grid items-center gap-x-8
        border-b border-white/5
        px-8 py-4
        text-foreground
        transition-all duration-200
        hover:bg-white/[0.03]
        last:border-b-0
      "
    >
      {children}
    </div>
  );
}

function Body<T>({ data = [], render }: BodyProps<T>) {
  if (!data.length) {
    return (
      <div className="px-8 py-16 text-center">
        <p className="text-lg font-medium text-[var(--primary-light)]">
          No data to show at the moment
        </p>

        <p className="mt-2 text-sm text-muted">
          New records will appear here.
        </p>
      </div>
    );
  }

  return <section>{data.map(render)}</section>;
}

function Footer({ children }: { children?: ReactNode }) {
  if (!children) return null;

  return (
    <footer
      className="
        flex justify-center
        border-t border-white/5
        bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_100%)]
        px-6 py-4
        backdrop-blur-xl
      "
    >
      {children}
    </footer>
  );
}

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;
Table.Footer = Footer;

export default Table;