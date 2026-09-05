import { toErrorResponse } from "@/lib/http";
import { runWatch } from "@/watches/runWatch";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await runWatch(id);

    return Response.json({
      watch: result.watch,
      snapshot: result.snapshot,
      message: result.baselineCreated ? "Baseline created" : "Watch run completed",
    });
  } catch (error) {
    return toErrorResponse(error, 404);
  }
}
