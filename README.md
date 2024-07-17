# Project Name
Boilerplate Hono

## Deskripsi
bikin boilerplate untuk framework Hono. coba dengan runtime Bun

## Instalasi

### Persiapan Awal
1. Pastikan Anda telah mempersiapkan sebuah database PostgreSQL.
2. Buatlah sebuah database baru dan catat konfigurasi koneksi (nama database, username, password).

### Instalasi Dependencies
Install semua dependencies yang diperlukan untuk proyek dengan menjalankan perintah berikut:

```sh
bun install
```

### Konfigurasi Prisma
Setelah database disiapkan, konfigurasikan Prisma dengan langkah-langkah berikut:

```sh
bunx prisma db push
bunx prisma generate
```
### Menjalankan Aplikasi
Untuk menjalankan aplikasi dalam mode pengembangan, gunakan perintah:
```sh
bun run dev
```
Aplikasi akan berjalan di http://localhost:3000.


### Penggunaan
Silakan akses user.http untuk menguji endpoint API users.

### Docker
Jika Anda menggunakan Docker untuk lingkungan pengembangan atau produksi, gunakan Docker Compose untuk menjalankan proyek:
```sh
docker compose up -d
```

Ini akan membangun dan menjalankan kontainer-kontainer yang diperlukan (termasuk Hono dan PostgreSQL) sesuai konfigurasi yang ada dalam docker-compose.yml.

### Kontribusi
Jika Anda ingin berkontribusi pada proyek ini, silakan lakukan fork dan buat pull request dengan perubahan yang diusulkan.

### Kontak
ikhsanheriyawan2404@gmail.com

