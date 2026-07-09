import { redirect } from "next/navigation";

export default async function AdminPage({params}: {params: Promise<{ token: string }>}) {
    const { token } = await params;

  redirect(`/onboarding/${token}/policies`);
}