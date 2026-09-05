import { listWatches } from "@/watches/listWatches";
import { createWatch } from "@/watches/createWatch";
import { createWatchSchema } from "@/watches/watchSchema";
import { toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const watches = await listWatches();
  return Response.json({ watches });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createWatchSchema.parse(body);
    const result = await createWatch(parsed);

    return Response.json(
      {
        watch: result.watch,
        message: "Baseline created",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
