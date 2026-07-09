import Image from "next/image";

export default function LoginHeader() {
    return (
        <div className="text-center">
            <Image
                src="/logo.png"
                alt="Logo"
                width={72}
                height={72}
                className="mx-auto"
            />

            <h1 className="mt-6 text-3xl font-bold metal-text">
                Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                Sign in to access the Internship Onboarding System.
            </p>
        </div>
    );
}