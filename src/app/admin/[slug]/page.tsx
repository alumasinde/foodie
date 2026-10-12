import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/dashboard";
export default async function RestaurantAdminPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const user=await currentUser();if(!user)redirect("/admin/login");const membership=await prisma.restaurantMembership.findFirst({where:{userId:user.id,isActive:true,restaurant:{slug}},include:{restaurant:{select:{id:true,name:true,slug:true}},role:true}});if(!membership)notFound();let permissions:string[]=[];try{permissions=JSON.parse(membership.role.permissions) as string[]}catch{/* Invalid legacy role data grants no permissions. */}return <AdminDashboard slug={slug} restaurantName={membership.restaurant.name} userName={`${user.firstName} ${user.lastName}`.trim()} roleName={membership.role.name} permissions={permissions}/>}
