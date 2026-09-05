import { formatSnapshotDate, plainText, tidyCopy } from "@/lib/format";
import type { SignalChange, WatchSnapshotSummary } from "@/types/signals";

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function renderSource(change: SignalChange) {
  const source = change.sources[0];

  if (!source) {
    return <span className="muted">No source captured</span>;
  }

  return (
    <a href={source.url} target="_blank" rel="noreferrer" className="source-link">
      {hostnameFromUrl(source.url)}
    </a>
  );
}

export function ChangeFeed({ snapshot }: { snapshot?: WatchSnapshotSummary }) {
  if (!snapshot || snapshot.isBaseline || snapshot.changes.length === 0) {
    return null;
  }

  return (
    <section className="change-feed">
      <div className="section-header">
        <div>
          <p className="hero-kicker">What changed</p>
          <h2 className="feed-heading">
            {snapshot.changes.length} meaningful{" "}
            {snapshot.changes.length === 1 ? "change" : "changes"}
          </h2>
        </div>
        <p className="muted">Since {formatSnapshotDate(snapshot.capturedAt)}</p>
      </div>

      <div className="change-list">
        {snapshot.changes.map((change, index) => {
          const summary = tidyCopy(change.summary, 220);

          return (
            <article key={`${change.type}-${index}`} className="change-item">
              <div className="change-item-top">
                <p className="event-type">{change.type}</p>
                <span className="score-badge">{change.meaningfulnessScore}</span>
              </div>
              <h3>{plainText(change.title)}</h3>
              {summary ? <p className="change-lede">{summary}</p> : null}

              <div className="change-form">
                <div className="change-field">
                  <span className="change-label">Why it matters</span>
                  <p>{plainText(change.whyItMatters)}</p>
                </div>
                <div className="change-field">
                  <span className="change-label">Next actions</span>
                  <ol className="action-list">
                    {change.nextActions.map((action) => (
                      <li key={action}>{plainText(action)}</li>
                    ))}
                  </ol>
                </div>
                <div className="change-field change-field-source">
                  <span className="change-label">Source</span>
                  {renderSource(change)}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
