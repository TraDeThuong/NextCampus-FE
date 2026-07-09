export default function AuthLayout({ children }: { children: React.ReactNode }) { 
    return  (
        <div className="auth-layout min-h-screen flex items-center justify-center bg-primary-dark">
            {children}
        </div> )
    } 