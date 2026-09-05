import { deleteWatchAction } from "@/app/actions";

export function DeleteWatchForm({ watchId }: { watchId: string }) {
  return (
    <form action={deleteWatchAction}>
      <input type="hidden" name="watchId" value={watchId} />
      <button type="submit" className="danger-button">
        Delete watch
      </button>
    </form>
  );
}
