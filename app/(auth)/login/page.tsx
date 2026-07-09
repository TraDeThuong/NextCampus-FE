'use client';

import { useRouter } from 'next/navigation'

export default function LoginPage() { 
    const router = useRouter();
    return (        
        <div className = "text-amber-50 flex justify-center items-center flex-col">
            <h1> ---- Login ---- </h1>
            <p> Admin, Leader, Intern Login Form here. </p>
            <p> A login form will be added where users can choose their role and sign in to access their dashboard. </p>
            
            <div className="space-y-4 flex flex-col m-5">
                <button onClick={() => router.push('/admin')}>
                    Login as Admin
                </button>

                <button onClick={() => router.push('/leader')}>
                    Login as Leader
                </button>

                <button onClick={() => router.push('/intern')}>
                    Login as Intern
                </button>
            </div>

        </div>)
    }