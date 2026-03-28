const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Aprobando todas las empresas...")
    await prisma.company.updateMany({
        where: { kycStatus: 'REVIEW_REQUESTED' },
        data: {
            kycStatus: 'APPROVED',
            isVerified: true
        }
    })
    
    // Y si alguna quedo en PENDING, igual la aprobamos para que el usuario no se trabe
    await prisma.company.updateMany({
        data: {
            kycStatus: 'APPROVED',
            isVerified: true
        }
    })
    console.log("¡Empresas aprobadas exitosamente!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
