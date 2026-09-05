import { runWatchAction } from "@/app/actions";

export function RunWatchForm({ watchId }: { watchId: string }) {
  return (
    <form action={runWatchAction}>
      <input type="hidden" name="watchId" value={watchId} />
      <button type="submit" className="primary-button">
        Run now
      </button>
    </form>
  );
}
