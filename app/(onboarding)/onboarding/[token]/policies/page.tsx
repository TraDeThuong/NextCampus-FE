import Link from "next/link";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PoliciesPage({ params }: Props) {
  const { token } = await params;

  return (
    <div>
      <h1>
        Onboarding Policies
      </h1>

      <p>Please read and agree to the company policies.</p>

      <Link href={`/onboarding/${token}/form`}>
        Agree & Continue
      </Link>
    </div>
  );
}