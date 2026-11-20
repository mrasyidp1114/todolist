# todolist

Aplikasi CLI To-Do List sederhana menggunakan Node.js (tanpa library eksternal).

## Cara menjalankan

Butuh Node.js versi 14 ke atas.

```bash
node todo.js add "Belajar Express"   # menambah tugas baru
node todo.js list                    # menampilkan semua tugas
node todo.js done 1                  # menandai tugas nomor 1 selesai
node todo.js delete 1                # menghapus tugas nomor 1
node todo.js clear                   # menghapus semua tugas yang sudah selesai
node todo.js help                    # menampilkan bantuan
```

Data disimpan di `todos.json` (dibuat otomatis di folder yang sama).
