import prisma from "@/lib/prisma";

export async function deleteWatch(id: string) {
  await prisma.watch.delete({
    where: {
      id,
    },
  });
}
