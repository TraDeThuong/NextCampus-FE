export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-10 space-y-12">
      
      {/* Heading Test */}
      <section className="space-y-4">
        <h1>Heading 1 - Nexora Technology</h1>
        <h2>Heading 2 - Building Future Solutions</h2>
        <h3>Heading 3 - Smart Digital Products</h3>
        <p>
          This is a paragraph to test your body font, spacing, readability,
          and overall text hierarchy. Your typography system should feel clean,
          modern, and balanced.
        </p>
      </section>

      {/* Color Palette Test */}
      <section className="space-y-4">
        <h2>Color Palette</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 rounded-xl bg-[var(--primary-dark)] flex items-center justify-center">
            Primary Dark
          </div>

          <div className="h-32 rounded-xl bg-[var(--primary-main)] flex items-center justify-center">
            Primary Main
          </div>

          <div className="h-32 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
            Primary Light
          </div>

          <div className="h-32 rounded-xl bg-[var(--secondary-dark)] flex items-center justify-center">
            Secondary Dark
          </div>

          <div className="h-32 rounded-xl bg-[var(--secondary-main)] flex items-center justify-center">
            Secondary Main
          </div>

          <div className="h-32 rounded-xl bg-[var(--secondary-light)] text-black flex items-center justify-center">
            Secondary Light
          </div>
        </div>
      </section>

      {/* Button Test */}
      <section className="space-y-4">
        <h2>Buttons</h2>

        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-lg bg-[var(--primary-main)] hover:bg-[var(--primary-light)] transition">
            Primary Button
          </button>

          <button className="px-6 py-3 rounded-lg border border-[var(--secondary-light)] text-[var(--text-secondary)] hover:bg-[var(--secondary-dark)] transition">
            Secondary Button
          </button>
        </div>
      </section>

      {/* Card Test */}
      <section className="space-y-4">
        <h2>Card Component</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <h3>Revenue</h3>
            <p>$12,500</p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <h3>Users</h3>
            <p>2,340</p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <h3>Growth</h3>
            <p>+18.4%</p>
          </div>
        </div>
      </section>

    </main>
  );
}