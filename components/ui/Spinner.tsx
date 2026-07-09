type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    wrapper: "w-6 h-6",
    outer: "border-2",
    inner: "border",
    inset: "inset-1",
  },
  md: {
    wrapper: "w-8 h-8",
    outer: "border-[3px]",
    inner: "border-2",
    inset: "inset-1",
  },
  lg: {
    wrapper: "w-12 h-12",
    outer: "border-4",
    inner: "border-[3px]",
    inset: "inset-1.5",
  },
};

export default function Spinner({ size = "md" }: SpinnerProps) {
  const s = sizes[size];

  return (
    <div className={`relative ${s.wrapper}`}>
      <div
        className={`absolute inset-0 rounded-full ${s.outer} border-zinc-700`}
      />

      <div
        className={`absolute inset-0 rounded-full ${s.outer} border-transparent border-t-white border-r-zinc-300 animate-spin`}
      />

      <div
        className={`absolute ${s.inset} rounded-full ${s.inner} border-transparent border-b-zinc-500 animate-spin [animation-direction:reverse] [animation-duration:1.5s]`}
      />
    </div>
  );
}