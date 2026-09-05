import { toErrorResponse } from "@/lib/http";
import { getWatchChanges } from "@/watches/getWatchChanges";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await getWatchChanges(id);

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error, 404);
  }
}
