const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = [
  ['menu:read', 'View menu', 'View menu items and categories'],
  ['menu:write', 'Manage menu', 'Create and edit menu items'],
  ['categories:write', 'Manage categories', 'Create and edit menu categories'],
  ['orders:read', 'View orders', 'View customer orders'],
  ['orders:write', 'Manage orders', 'Update order status'],
  ['reservations:read', 'View reservations', 'View table bookings'],
  ['reservations:write', 'Manage reservations', 'Confirm or decline bookings'],
  ['settings:write', 'Manage website', 'Edit restaurant profile and homepage'],
  ['hours:write', 'Manage opening hours', 'Edit opening hours'],
  ['users:manage', 'Manage team', 'Create team accounts and assign roles'],
];
const templates = [
  { name: 'Owner', key: 'owner', keys: permissions.map(p => p[0]) },
  { name: 'Manager', key: 'manager', keys: ['menu:read','menu:write','categories:write','orders:read','orders:write','reservations:read','reservations:write','settings:write','hours:write'] },
  { name: 'Menu Editor', key: 'menu_editor', keys: ['menu:read','menu:write','categories:write','hours:write'] },
  { name: 'Order & Booking Staff', key: 'order_staff', keys: ['menu:read','orders:read','orders:write','reservations:read','reservations:write'] },
];

async function main() {
  for (const [key, name, description] of permissions) {
    await prisma.permission.upsert({ where: { key }, update: { name, description }, create: { key, name, description } });
  }
  const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true } });
  for (const restaurant of restaurants) {
    for (const template of templates) {
      const role = await prisma.restaurantRole.upsert({
        where: { restaurantId_key: { restaurantId: restaurant.id, key: template.key } },
        update: { name: template.name, isSystem: true },
        create: { restaurantId: restaurant.id, name: template.name, key: template.key, isSystem: true },
      });
      await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
      await prisma.rolePermission.createMany({ data: template.keys.map(permissionKey => ({ roleId: role.id, permissionKey })) });
    }
    console.log(`Seeded permissions and default roles for ${restaurant.name}`);
  }
  console.log(`Seeded ${permissions.length} permissions across ${restaurants.length} restaurants. User accounts are intentionally not created by seed.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
