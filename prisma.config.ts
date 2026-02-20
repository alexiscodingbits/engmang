import path from 'node:path'

export default {
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async development() {
      return {
        url: process.env.DATABASE_URL,
      }
    },
  },
}