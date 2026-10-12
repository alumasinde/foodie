import { redirect } from "next/navigation";
import { currentUser } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
export default async function AdminEntry(){const user=await currentUser();if(!user)redirect("/admin/login");const membership=await prisma.restaurantMembership.findFirst({where:{userId:user.id,isActive:true},include:{restaurant:{select:{slug:true}}},orderBy:{createdAt:"asc"}});if(!membership)redirect("/admin/login");redirect(`/admin/${membership.restaurant.slug}`)}
