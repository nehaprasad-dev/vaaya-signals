import Link from "next/link";
import { WatchList } from "@/components/watch-list";
import { listWatches } from "@/watches/listWatches";

export const dynamic = "force-dynamic";

export default async function WatchesPage() {
  const watches = await listWatches();

  return (
    <main>
      <section className="page-shell hero">
        <div className="hero-copy">
          <p className="hero-kicker">Company intelligence</p>
          <h1 className="display-title">See what changed. Know why it matters.</h1>
          <p className="hero-lede">
            Watch a company once. Each run diffs the latest snapshot and ranks only
            the buying signals worth acting on.
          </p>
          <div className="metric-card">
            <div>
              <p className="metric-value">6</p>
              <p className="metric-label">Signal types watched</p>
            </div>
            <div>
              <p className="metric-value">1st</p>
              <p className="metric-label">Run stores a baseline</p>
            </div>
          </div>
        </div>

        <aside className="signal-panel" aria-label="Example signal mix">
          <div className="signal-row signal-row-total">
            <span>All signals</span>
            <div className="signal-bar"><i className="bar-100" /></div>
            <b>100%</b>
          </div>
          <div className="signal-row signal-row-parent">
            <span>Hiring</span>
            <div className="signal-bar"><i className="bar-72" /></div>
            <b>32%</b>
          </div>
          <div className="signal-row signal-row-child">
            <span>Enterprise roles</span>
            <div className="signal-bar"><i className="bar-48" /></div>
            <b>18%</b>
          </div>
          <div className="signal-row signal-row-child">
            <span>GTM expansion</span>
            <div className="signal-bar"><i className="bar-36" /></div>
            <b>14%</b>
          </div>
          <div className="signal-row signal-row-parent">
            <span>Product</span>
            <div className="signal-bar"><i className="bar-58" /></div>
            <b>24%</b>
          </div>
          <div className="signal-row signal-row-child">
            <span>New product page</span>
            <div className="signal-bar"><i className="bar-40" /></div>
            <b>14%</b>
          </div>
          <div className="signal-row signal-row-parent">
            <span>News</span>
            <div className="signal-bar"><i className="bar-44" /></div>
            <b>18%</b>
          </div>
          <div className="signal-row signal-row-parent">
            <span>Pricing</span>
            <div className="signal-bar"><i className="bar-34" /></div>
            <b>14%</b>
          </div>
          <div className="signal-row signal-row-parent">
            <span>Leadership</span>
            <div className="signal-bar"><i className="bar-28" /></div>
            <b>12%</b>
          </div>
        </aside>
      </section>

      <section className="page-shell features">
        <p className="hero-kicker">How it works</p>
        <h2 className="section-title">From first snapshot to a ranked change feed</h2>
        <p className="section-lede">
          Add a company, store a baseline, then only surface the changes that
          actually move a deal.
        </p>
        <div className="feature-grid">
          <article>
            <span className="feature-icon" aria-hidden="true">01</span>
            <h3>Company watches</h3>
            <p>Track one URL and the signals you care about. No more tab-hopping.</p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">02</span>
            <h3>Baseline first</h3>
            <p>The first run stores current state so later runs are real diffs.</p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">03</span>
            <h3>Hiring signals</h3>
            <p>New roles and GTM expansion show up as ranked hiring changes.</p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">04</span>
            <h3>Product and pricing</h3>
            <p>Launches and packaging shifts are captured from live pages.</p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">05</span>
            <h3>Why it matters</h3>
            <p>Every change includes a short explanation, not just a headline.</p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">06</span>
            <h3>Next action</h3>
            <p>Each signal comes with a clear follow-up, not a research pile.</p>
          </article>
        </div>
      </section>

      <section id="watches-list" className="page-shell dashboard">
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">
              {watches.length === 0
                ? "Your company watches"
                : `${watches.length} compan${watches.length === 1 ? "y" : "ies"} on watch`}
            </h2>
            <p className="section-lede">
              Open a company to see the latest snapshot, sources, and ranked changes.
            </p>
          </div>
          <Link href="/watches/new" className="primary-button">
            Add company
          </Link>
        </div>
        <WatchList watches={watches} />
      </section>
    </main>
  );
}
