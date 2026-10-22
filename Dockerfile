# --- build: Nuxt static generation -> .output/public ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
# Canonical origin baked into canonical links, Open Graph, JSON-LD, sitemap and llms.txt
ARG NUXT_PUBLIC_SITE_URL=https://lonvisuals.com
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL NUXT_TELEMETRY_DISABLED=1
RUN npm run generate

# --- serve: nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-headers.conf /etc/nginx/snippets/headers.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 8080
