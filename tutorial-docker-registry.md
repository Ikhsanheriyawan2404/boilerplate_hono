# Tutorial: Konfigurasi Private Docker Registry Self-Host dan Menggunakan GitHub Actions untuk Push dan Pull

## Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Prasyarat](#prasyarat)
3. [Instalasi Docker Registry](#instalasi-docker-registry)
4. [Konfigurasi Docker Registry](#konfigurasi-docker-registry)
    - [Setting SSL dengan Nginx](#setting-ssl-dengan-nginx)
    - [Setting Authentication](#setting-authentication)
5. [Setup Server untuk Instalasi](#setup-server-untuk-instalasi)
6. [Konfigurasi Environment](#konfigurasi-environment)
    - [.env.prod](#envprod)
    - [.env.dev](#envdev)
7. [Menyiapkan GitHub Actions](#menyiapkan-github-actions)
8. [Menjalankan GitHub Actions](#menjalankan-github-actions)
9. [Kesimpulan](#kesimpulan)
10. [Referensi](#referensi)

---

## Pendahuluan

Dalam tutorial ini, kita akan belajar cara mengkonfigurasi Docker registry private yang di-hosting sendiri dan menguji proses push dan pull menggunakan GitHub Actions. 

## Prasyarat

- Docker dan Docker Compose terinstal
- Domain untuk SSL

## Instalasi Docker Registry

1. Buat file `docker-compose.yml` untuk Docker registry:
    ```yaml
    version: '3'
    services:
      main-nginx-proxy:
        image: jwilder/nginx-proxy
        container_name: main-nginx-proxy
        ports:
          - "80:80"
          - "443:443"
        volumes:
          - /var/run/docker.sock:/tmp/docker.sock:ro
          - ./nginx/certs:/etc/nginx/certs:ro
          - ./nginx/vhost.d:/etc/nginx/vhost.d
          - ./nginx/html:/usr/share/nginx/html
          - ./nginx/conf.d:/etc/nginx/conf.d
          - ./nginx/letsencrypt/etc:/etc/letsencrypt:ro
          - ./nginx/proxy_max_body.conf:/etc/nginx/conf.d/proxy.conf:ro
        labels:
          com.github.nginx-proxy.nginx-proxy: "true"
        networks:
          - hono_network

      letsencrypt:
        image: nginxproxy/acme-companion
        container_name: letsencrypt
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
          - ./nginx/certs:/etc/nginx/certs:rw
          - ./nginx/vhost.d:/etc/nginx/vhost.d
          - ./nginx/html:/usr/share/nginx/html
          - ./nginx/letsencrypt:/etc/acme.sh
          - ./nginx/letsencrypt/etc:/etc/letsencrypt
        environment:
          DEFAULT_EMAIL: ikhsanheriyawan2404@gmail.com
          NGINX_PROXY_CONTAINER: main-nginx-proxy
        depends_on:
          - main-nginx-proxy
        networks:
          - hono_network

      registry:
        image: registry:2
        environment:
          REGISTRY_AUTH: htpasswd
          REGISTRY_AUTH_HTPASSWD_REALM: Registry
          REGISTRY_AUTH_HTPASSWD_PATH: /auth/registry.password
          REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /data
          VIRTUAL_HOST: domain.name.com
          LETSENCRYPT_HOST: domain.name.com
          LETSENCRYPT_EMAIL: ikhsanheriyawan2404@gmail.com
        volumes:
          - ./registry_data:/var/lib/registry
          - ./registry_auth:/auth
        networks:
          - hono_network
        restart: always
              
      db_hono:
        image: postgres:latest
        ports:
          - "${DB_PORT}:${DB_PORT}"
        environment:
          POSTGRES_USER: ${DB_USERNAME}
          POSTGRES_PASSWORD: ${DB_PASSWORD}
          POSTGRES_DB: ${DB_DATABASE}
        volumes:
          - db-hono:/var/lib/postgresql/data
        networks:
          - hono_network

    volumes:
      db-hono:

    networks:
      hono_network:
        driver: bridge

    ```

## Konfigurasi Docker Registry

### Setting NGINX config untuk max upload

1. Buat file `proxy_max_body.conf`:
    ```nginx
    client_max_body_size 16384m;
    ```

### Setting Authentication

1. Buat file `registry.password` untuk autentikasi dasar (gunakan htpasswd tool dari Apache):
    ```sh
    // kalom belum ada bisa install
    sudo apt install apache2-utils -y
    ```
    ```sh
    cd registry_auth
    htpasswd -Bc registry.password username
    ```

## Konfigurasi Environment

### .env.prod

1. Buat file `.env.prod`:
    ```env
    DATABASE_URL="postgresql://postgres:admin@db_hono:5434/bun?schema=public"
    PORT=3000
    DB_HOST=db_hono
    DB_PORT=5434
    DB_DATABASE=bun
    DB_USERNAME=postgres
    DB_PASSWORD=admin
    ```

### .env.dev

1. Buat file `.env.dev`:
    ```env
    DATABASE_URL="postgresql://postgres:admin@db_hono:5434/bun_test?schema=public"
    PORT=3001
    DB_HOST=db_hono
    DB_PORT=5434
    DB_DATABASE=bun_test
    DB_USERNAME=postgres
    DB_PASSWORD=admin
    ```

## Setup Server untuk Instalasi

1. Jalankan `docker compose up -d` untuk memulai Docker registry dan Nginx dengan SSL dan autentikasi.


## Menyiapkan GitHub Actions

1. Buat file `.github/workflows/docker.yml`:
    ```yaml
    name: CI/CD

    on:
      push:
        branches:
          - main
          - dev
      pull_request:
        branches:
          - main
          - dev

    jobs:
      build:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
          uses: actions/checkout@v2

        - name: Log in to registry
          uses: docker/login-action@v1
          with:
            registry: ${{ secrets.REGISTRY_HOST }}
            username: ${{ secrets.REGISTRY_USERNAME }}
            password: ${{ secrets.REGISTRY_PASSWORD }}

        - name: Build and push Docker image
          uses: docker/build-push-action@v2
          with:
            context: .
            push: true
            tags: ${{ secrets.REGISTRY_HOST }}/hono:${{ github.ref == 'refs/heads/main' && 'latest' || 'dev' }}

      deploy_main:
        needs: build
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'

        steps:
        - name: Checkout code
          uses: actions/checkout@v2

        - name: Add SSH key
          uses: webfactory/ssh-agent@v0.5.3
          with:
            ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

        - name: Deploy to Production
          env:
            HOST: ${{ secrets.HOST }}
            USER: ${{ secrets.USER }}
          run: |
            ssh -o StrictHostKeyChecking=no $USER@$HOST << 'EOF'
              cd /var/www/html/hono
              docker compose -f compose.yml -f compose.prod.yml --env-file .env.production pull
              docker compose -f compose.yml -f compose.prod.yml --env-file .env.production up -d
            EOF

      deploy_dev:
        needs: build
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/dev'

        steps:
        - name: Checkout code
          uses: actions/checkout@v2

        - name: Add SSH key
          uses: webfactory/ssh-agent@v0.5.3
          with:
            ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

        - name: Deploy to Development
          env:
            HOST: ${{ secrets.HOST }}
            USER: ${{ secrets.USER }}
          run: |
            ssh -o StrictHostKeyChecking=no $USER@$HOST << 'EOF'
              cd /var/www/html/hono
              docker compose -f compose.yml -f compose.dev.yml --env-file .env.development pull
              docker compose -f compose.yml -f compose.dev.yml --env-file .env.development up -d
            EOF

    ```

## Menjalankan GitHub Actions

1. Push kode Anda ke repository GitHub.
2. GitHub Actions akan otomatis berjalan dan mencoba build dan push image Docker ke registry yang sudah dikonfigurasi.

## Kesimpulan

Dalam tutorial ini, kita telah mengkonfigurasi Docker registry private yang di-hosting sendiri, mengamankannya dengan SSL dan autentikasi dasar menggunakan Nginx, dan mengatur GitHub Actions untuk mengotomatisasi proses build dan push image Docker.

## Referensi

- [How To Set Up a Private Docker Registry on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-private-docker-registry-on-ubuntu-20-04)
