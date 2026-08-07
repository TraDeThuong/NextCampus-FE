import MetalCard from "@/components/ui/MetalCard";

export default function DesignText() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-12 space-y-12">
      
      <section className="space-y-8">
        <h1 className="metal-text">Silver Metallic</h1>
        <h1 className="metal-blue">Blue Steel Metallic</h1>
        <h1 className="chrome-text">Chrome Reflection</h1>
        <h1 className="metal-blue metal-glow">Nexora Premium</h1>
      </section>

      <section className="space-y-6">
        <div className="p-8 rounded-2xl bg-[var(--secondary-dark)] border border-[var(--secondary-light)]">
          <h2 className="metal-text">Future Technology</h2>
          <p className="text-[var(--text-secondary)] mt-4">
            Testing premium metallic typography over dark surfaces.
          </p>
        </div>
      </section>

        <MetalCard className="w-105 p-8">
            <h2 className="metal-text">
                Nexora
            </h2>

            <p className="mt-4 text-slate-300">
                Premium digital infrastructure.
            </p>
        </MetalCard>

    </main>
  );
}