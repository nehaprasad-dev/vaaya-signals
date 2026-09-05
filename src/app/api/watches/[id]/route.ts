import { deleteWatch } from "@/watches/deleteWatch";
import { getWatch } from "@/watches/getWatch";
import { toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const watch = await getWatch(id);

  if (!watch) {
    return Response.json(
      {
        error: "Watch not found.",
      },
      {
        status: 404,
      },
    );
  }

  return Response.json({ watch });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteWatch(id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    return toErrorResponse(error, 404);
  }
}
