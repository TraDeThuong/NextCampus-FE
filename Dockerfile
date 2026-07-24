# Standalone output (built by GitHub Actions, rsynced to VPS)
# Chỉ cần copy standalone folder vào container, không cần npm install
FROM node:22-alpine
WORKDIR /app

# Copy standalone output (đã build bởi GitHub Actions)
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js là entry point của Next.js standalone
CMD ["node", "server.js"]
