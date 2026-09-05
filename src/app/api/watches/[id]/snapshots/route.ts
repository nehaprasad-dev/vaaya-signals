import { toErrorResponse } from "@/lib/http";
import { listSnapshots } from "@/snapshots/listSnapshots";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const snapshots = await listSnapshots(id);

    return Response.json({ snapshots });
  } catch (error) {
    return toErrorResponse(error, 404);
  }
}
