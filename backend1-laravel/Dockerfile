# Stage 1: Build stage
FROM php:8.3-fpm-alpine as build

# Install system dependencies
RUN apk add --no-cache \
    linux-headers \
    zip \
    unzip \
    git \
    curl \
    sqlite-dev \
    # Dependencies for various PHP extensions
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    nodejs \
    npm \
    $PHPIZE_DEPS

# Install rdkafka from edge/community
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
    librdkafka-dev

# Install PHP extensions one by one to better handle errors
RUN docker-php-ext-install pdo pdo_mysql
RUN docker-php-ext-install pdo_sqlite
RUN docker-php-ext-install zip
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install opcache
RUN docker-php-ext-install exif
RUN docker-php-ext-install pcntl

# Install GD with proper configuration
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# Install rdkafka
RUN pecl install rdkafka \
    && docker-php-ext-enable rdkafka

# Install composer
COPY --from=composer:2.7.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./ 
# Install dependencies
RUN composer install --no-dev --prefer-dist --no-scripts --no-autoloader

# Copy the rest of the application code
COPY . .

# Generate optimized autoload files
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Install and build frontend assets
RUN npm install \
    && npm run build

# Stage 2: Production stage
FROM php:8.3-fpm-alpine

# Install production dependencies
RUN apk add --no-cache \
    linux-headers \
    nginx \
    zip \
    unzip \
    sqlite-dev \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    libxml2 \
    oniguruma \
    # Build dependencies
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    $PHPIZE_DEPS

# Install rdkafka from edge/community
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
    librdkafka \
    librdkafka-dev

# Install PHP extensions one by one
RUN docker-php-ext-install pdo pdo_mysql
RUN docker-php-ext-install pdo_sqlite
RUN docker-php-ext-install zip
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install opcache
RUN docker-php-ext-install exif
RUN docker-php-ext-install pcntl

# Install GD with proper configuration
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# Install rdkafka
RUN pecl install rdkafka \
    && docker-php-ext-enable rdkafka

# Cleanup
RUN apk del $PHPIZE_DEPS \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Copy nginx configuration
COPY deploy/nginx.conf /etc/nginx/http.d/default.conf

# Copy PHP configuration
COPY deploy/php.ini /usr/local/etc/php/conf.d/custom.ini

# Copy application from build stage
COPY --from=build /var/www/html /var/www/html
COPY --from=composer:2.7.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache \
    && chmod +x /usr/bin/composer

# Create volume for persistent storage
VOLUME ["/var/www/html/storage/app"]

# Start nginx and php-fpm
CMD ["sh", "-c", "nginx && php-fpm"]
