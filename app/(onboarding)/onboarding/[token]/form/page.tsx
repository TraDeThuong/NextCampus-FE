import Link from "next/link";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InformationFormPage({ params }: Props) {
  const { token } = await params;

  return (
    <div>
      <h1>Information Form</h1>
      <p>Fill out your details.</p>

      <Link href={`/onboarding/${token}/success`}>
        Submit
      </Link>
    </div>
  );
}