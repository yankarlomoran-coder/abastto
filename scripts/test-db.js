const fs = require('fs');
try {
    require('dotenv').config();
    const { PrismaClient } = require('@prisma/client');

    const url = process.env.DIRECT_URL + (process.env.DIRECT_URL.includes('?') ? '&' : '?') + 'connect_timeout=10';
    console.log('Testing connection to:', url.replace(/:[^:@]*@/, ':****@'));

    const prisma = new PrismaClient({
        datasourceUrl: url,
        log: ['query', 'info', 'warn', 'error']
    });

    async function main() {
        console.log('🔌 Connecting...');
        await prisma.$connect();
        console.log('✅ Connected!');
        const count = await prisma.user.count();
        console.log('User count:', count);
        await prisma.$disconnect();
    }

    main().catch(e => {
        console.error('Expected Error:', e);
        fs.writeFileSync('error.log', 'Async Error: ' + e.toString() + '\\n' + (e.stack || ''));
        process.exit(1);
    });

} catch (e) {
    console.error('Sync Error:', e);
    fs.writeFileSync('error.log', 'Sync Error: ' + e.toString() + '\\n' + (e.stack || ''));
    process.exit(1);
}
