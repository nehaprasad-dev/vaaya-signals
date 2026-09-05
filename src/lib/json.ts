import type { Prisma } from "@prisma/client";

export function toInputJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.JsonValue;
}

export function fromJsonValue<T>(value: Prisma.JsonValue | null) {
  return value as unknown as T;
}
