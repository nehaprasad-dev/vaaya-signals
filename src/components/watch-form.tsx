import Link from "next/link";
import { createWatchAction } from "@/app/actions";
import { SIGNAL_TYPES } from "@/types/signals";

const signalLabels: Record<(typeof SIGNAL_TYPES)[number], string> = {
  funding: "Funding",
  hiring: "Hiring",
  product: "Product launches",
  pricing: "Pricing",
  leadership: "Leadership",
  news: "News",
};

export function WatchForm() {
  return (
    <div className="form-card">
      <div className="form-card-header">
        <div>
          <p className="kicker">Create watch</p>
          <h2>Company details</h2>
        </div>
        <Link href="/watches" className="text-link">
          View watches
        </Link>
      </div>

      <form action={createWatchAction} className="stack-lg">
        <label className="field">
          <span className="field-title">Company URL</span>
          <input
            type="url"
            name="companyUrl"
            placeholder="https://stripe.com"
            required
          />
        </label>

        <label className="field">
          <span className="field-title">Company name</span>
          <input
            type="text"
            name="companyName"
            placeholder="Optional if the URL already identifies it"
          />
        </label>

        <label className="field">
          <span className="field-title">Watch frequency</span>
          <select name="watchFrequency" defaultValue="6h">
            <option value="6h">Every 6 hours</option>
            <option value="12h">Every 12 hours</option>
            <option value="24h">Every 24 hours</option>
          </select>
        </label>

        <div className="stack-sm">
          <div className="field-heading-row">
            <span className="field-title">Signals to watch</span>
            <span className="muted">Pick only what you care about</span>
          </div>
          <div className="signal-grid">
            {SIGNAL_TYPES.map((signal) => (
              <label key={signal} className="checkbox-card">
                <input
                  type="checkbox"
                  name={signal}
                  defaultChecked={signal !== "news"}
                />
                <span>{signalLabels[signal]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-footer">
          <p className="muted">
            The first run creates a baseline snapshot, not a fake change list.
          </p>
          <button type="submit" className="primary-button">
            Start watching
          </button>
        </div>
      </form>
    </div>
  );
}
