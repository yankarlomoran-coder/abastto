try {
    const prisma = require('@prisma/client');
    console.log('Keys:', Object.keys(prisma));
    console.log('Type of default:', typeof prisma.default);
    console.log('Type of PrismaClient:', typeof prisma.PrismaClient);
} catch (e) {
    console.error(e);
}
