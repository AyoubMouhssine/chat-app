FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
   linux-headers \
   nginx \
   zip \
   unzip \
   git \
   curl \
   sqlite-dev \
   libzip-dev \
   libpng-dev \
   libjpeg-turbo-dev \
   freetype-dev \
   oniguruma-dev \
   libxml2-dev \
   nodejs \
   npm \
   $PHPIZE_DEPS

RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
   librdkafka-dev

RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite zip bcmath opcache exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && docker-php-ext-install gd
RUN pecl install rdkafka && docker-php-ext-enable rdkafka

COPY --from=composer:2.7.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY deploy/nginx.conf /etc/nginx/http.d/default.conf
COPY deploy/php.ini /usr/local/etc/php/conf.d/custom.ini

RUN composer install --no-dev --prefer-dist \
   && npm install \
   && npm run build \
   && php artisan key:generate \
   && chown -R www-data:www-data . \
   && chmod -R 775 storage bootstrap/cache

VOLUME ["/var/www/html/storage/app"]

CMD ["sh", "-c", "nginx && php-fpm"]