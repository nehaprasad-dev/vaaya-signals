export function toErrorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unexpected error.";

  return Response.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}
