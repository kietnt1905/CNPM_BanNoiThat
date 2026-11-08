# syntax=docker/dockerfile:1.7
#
# Một Dockerfile cho cả dự án (context = thư mục gốc). Build theo target:
#   docker build --target backend  -t tkhouse-api .
#   docker build --target frontend -t tkhouse-web .

# ======================= BACKEND (Laravel) =======================

# ---- Cài dependency PHP (chỉ production) ----
FROM composer:2 AS vendor
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
      --no-dev --no-scripts --no-autoloader \
      --prefer-dist --no-interaction --no-progress
COPY backend/ .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

# ---- Runtime: PHP 8.3 FPM + Nginx, chạy non-root, cổng 8080 ----
FROM serversideup/php:8.3-fpm-nginx AS backend
ENV AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    PHP_OPCACHE_ENABLE=1 \
    HEALTHCHECK_PATH=/up \
    APP_ENV=local \
    APP_DEBUG=true
WORKDIR /var/www/html
COPY --chown=www-data:www-data backend/ .
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
RUN mkdir -p public/uploads/products public/uploads/avatars database storage/logs \
      storage/framework/cache storage/framework/sessions storage/framework/views \
 && chown -R www-data:www-data public/uploads database storage bootstrap/cache
# Dữ liệu cần giữ giữa các lần deploy -> mount volume
VOLUME ["/var/www/html/public/uploads", "/var/www/html/storage", "/var/www/html/database"]
# Seed dữ liệu mẫu khi khởi động (chỉ chạy nếu AUTO_SEED=true và bảng categories còn trống)
COPY --chmod=755 <<'SEED' /etc/entrypoint.d/60-seed.sh
#!/bin/sh
[ "$AUTO_SEED" = "true" ] || exit 0
count=$(php artisan tinker --execute="echo DB::table('categories')->count();" 2>/dev/null | tail -n1)
if [ "$count" = "0" ]; then
  echo "Database trống -> chạy db:seed"
  php artisan db:seed --force
fi
SEED
USER root
RUN sed -i 's/[[:cntrl:]]$//' /etc/entrypoint.d/60-seed.sh
USER www-data
EXPOSE 8080

# ======================= FRONTEND (React/Vite) =======================

# ---- Build SPA ----
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY frontend/ .
RUN npm run build

# ---- Runtime: Nginx non-root phục vụ file tĩnh, cổng 8080 ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS frontend
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    server_tokens off;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    location = /healthz { access_log off; return 200 "ok"; }
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    location = /index.html { add_header Cache-Control "no-cache"; }
    location / { try_files $uri $uri/ /index.html; }
}
NGINX
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
