import { formatSnapshotDate, plainText, tidyCopy } from "@/lib/format";
import type { NormalizedEvent, SignalType, WatchSnapshotSummary } from "@/types/signals";

const SIGNAL_ORDER: SignalType[] = [
  "funding",
  "hiring",
  "product",
  "pricing",
  "leadership",
  "news",
];

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function countByType(events: NormalizedEvent[]) {
  const counts = new Map<SignalType, number>();

  for (const event of events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  }

  return SIGNAL_ORDER.filter((type) => (counts.get(type) ?? 0) > 0).map((type) => ({
    type,
    count: counts.get(type) ?? 0,
    percent: events.length === 0 ? 0 : Math.round(((counts.get(type) ?? 0) / events.length) * 100),
  }));
}

function statusCopy(snapshot?: WatchSnapshotSummary) {
  if (!snapshot) {
    return "Run now to pull live company signals.";
  }

  if (snapshot.isBaseline) {
    return `First capture on ${formatSnapshotDate(snapshot.capturedAt)}. This is the current company state.`;
  }

  if (snapshot.changes.length === 0) {
    return `Checked ${formatSnapshotDate(snapshot.capturedAt)}. No new diffs — current signals are below.`;
  }

  return `Checked ${formatSnapshotDate(snapshot.capturedAt)}. ${snapshot.changes.length} new diffs above, current state below.`;
}

export function CapturedState({ snapshot }: { snapshot?: WatchSnapshotSummary }) {
  const events = snapshot?.data.events ?? [];
  const mix = countByType(events);

  if (!snapshot) {
    return <p className="status-note">{statusCopy(snapshot)}</p>;
  }

  return (
    <>
      <p className="status-note">{statusCopy(snapshot)}</p>

      <div className="snapshot-layout">
        <section>
          <p className="hero-kicker">Company snapshot</p>
          <h2 className="feed-heading">
            {events.length === 0
              ? "No live signals yet"
              : `${events.length} live signal${events.length === 1 ? "" : "s"}`}
          </h2>

          <div className="event-list">
            {events.length === 0 ? (
              <p className="muted">The latest run did not return product, hiring, or news events.</p>
            ) : (
              events.map((event) => {
                const source = event.sources[0];

                return (
                  <article key={event.id} className="event-row">
                    <p className="event-type">{event.type}</p>
                    <div>
                      <p className="event-title">{plainText(event.title)}</p>
                      {event.summary ? (
                        <p className="event-summary">{tidyCopy(event.summary, 180)}</p>
                      ) : null}
                      {source ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="event-source"
                        >
                          {hostnameFromUrl(source.url)}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="snapshot-aside">
          {mix.length > 0 ? (
            <section>
              <p className="kicker">Mix</p>
              <h2>Signal split</h2>
              <div className="signal-panel snapshot-mix">
                {mix.map((row) => (
                  <div key={row.type} className="signal-row signal-row-parent">
                    <span>{row.type}</span>
                    <div className="signal-bar">
                      <i style={{ width: `${Math.max(row.percent, 8)}%` }} />
                    </div>
                    <b>{row.count}</b>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {snapshot.data.profile.summary ? (
            <section>
              <p className="kicker">Profile</p>
              <h2>Company state</h2>
              <p className="muted">{plainText(snapshot.data.profile.summary)}</p>
              <p className="profile-meta">
                {snapshot.data.company.pricing.length > 0
                  ? `${snapshot.data.company.pricing.length} pricing points`
                  : "No pricing parsed"}
                {" · "}
                {snapshot.data.company.leadership.length > 0
                  ? `${snapshot.data.company.leadership.length} leaders`
                  : "No leadership rows"}
                {" · "}
                {snapshot.data.profile.enterpriseRoleCount ?? 0} hiring rows
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
