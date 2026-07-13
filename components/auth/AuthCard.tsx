export default function AuthCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-glass">
            {children}
        </div>
    );
}
