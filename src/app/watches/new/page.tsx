import { WatchForm } from "@/components/watch-form";

export default function NewWatchPage() {
  return (
    <main className="page-shell create-page">
      <section className="create-copy">
        <p className="hero-kicker">New company watch</p>
        <h1 className="page-title">Watch a company. Get only the changes that matter.</h1>
        <p className="hero-lede">
          Add a URL, pick the signals you care about, and replace repeated research
          with a ranked change feed.
        </p>

        <ol className="setup-steps">
          <li>
            <strong>Baseline first</strong>
            <span>The first run stores current state without inventing changes.</span>
          </li>
          <li>
            <strong>Meaningful diffs</strong>
            <span>Later runs compare snapshots and drop low-value noise.</span>
          </li>
          <li>
            <strong>Clear next step</strong>
            <span>Every signal explains why it matters and what to do next.</span>
          </li>
        </ol>
      </section>

      <WatchForm />
    </main>
  );
}
