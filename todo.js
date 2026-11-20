#!/usr/bin/env node
/**
 * CLI To-Do List sederhana (Node.js, hanya modul bawaan)
 *
 * Penggunaan:
 *   node todo.js add "judul tugas"   → menambah tugas baru
 *   node todo.js list                → menampilkan semua tugas
 *   node todo.js done <nomor>        → menandai tugas selesai
 *   node todo.js delete <nomor>      → menghapus tugas
 *   node todo.js clear               → menghapus semua tugas yang sudah selesai
 */

// Modul bawaan Node.js: 'fs' untuk baca/tulis file, 'path' untuk menyusun path file
const fs = require('fs');
const path = require('path');

// __dirname = folder tempat file todo.js ini berada.
// Jadi todos.json selalu disimpan di folder yang sama dengan todo.js,
// tidak peduli dari folder mana perintah dijalankan.
const DATA_FILE = path.join(__dirname, 'todos.json');

// ---------------------------------------------------------------------------
// Bagian 1: Fungsi untuk membaca & menyimpan data
// ---------------------------------------------------------------------------

/**
 * Membaca daftar tugas dari todos.json.
 * Kalau file belum ada, file dibuat otomatis berisi array kosong [].
 */
function loadTodos() {
  if (!fs.existsSync(DATA_FILE)) {
    saveTodos([]); // buat file baru
    return [];
  }

  try {
    const isi = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(isi || '[]'); // file kosong dianggap array kosong

    if (!Array.isArray(data)) {
      throw new Error('isi file bukan array');
    }
    return data;
  } catch (err) {
    // Kalau isi file rusak (JSON tidak valid), hentikan program dengan pesan jelas
    // supaya data pengguna tidak tertimpa tanpa sengaja.
    exitWithError(
      `File ${DATA_FILE} rusak atau tidak valid (${err.message}).\n` +
        '  Perbaiki isinya secara manual atau hapus file tersebut untuk mulai dari awal.'
    );
  }
}

/**
 * Menyimpan daftar tugas ke todos.json.
 * JSON.stringify(data, null, 2) → format rapi dengan indentasi 2 spasi.
 */
function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Bagian 2: Fungsi bantu (helper)
// ---------------------------------------------------------------------------

/** Menampilkan pesan error lalu keluar dengan kode 1 (menandakan gagal). */
function exitWithError(pesan) {
  console.error(`Error: ${pesan}`);
  process.exit(1);
}

/**
 * Membuat id unik untuk tugas baru: id terbesar yang ada + 1.
 * Id berbeda dengan "nomor": id tetap selamanya, sedangkan nomor
 * hanyalah urutan tampilan di layar (1, 2, 3, ...) yang bisa berubah
 * setelah ada tugas yang dihapus.
 */
function generateId(todos) {
  return todos.reduce((maks, t) => Math.max(maks, t.id), 0) + 1;
}

/**
 * Mengubah argumen <nomor> dari teks menjadi index array.
 * Memastikan nomor berupa bilangan bulat positif dan tugasnya ada.
 */
function parseNomor(arg, todos) {
  if (arg === undefined) {
    exitWithError('Nomor tugas wajib diisi. Contoh: node todo.js done 1');
  }

  // Hanya terima angka murni (tolak "1a", "-1", "1.5", dll.)
  if (!/^\d+$/.test(arg)) {
    exitWithError(`"${arg}" bukan nomor yang valid. Gunakan angka bulat positif, misalnya 1.`);
  }

  const nomor = Number(arg);

  if (todos.length === 0) {
    exitWithError('Daftar tugas masih kosong. Tambahkan tugas dulu dengan perintah "add".');
  }
  if (nomor < 1 || nomor > todos.length) {
    exitWithError(`Tugas nomor ${nomor} tidak ditemukan. Nomor yang tersedia: 1 sampai ${todos.length}.`);
  }

  return nomor - 1; // nomor dimulai dari 1, index array dimulai dari 0
}

/** Format tanggal ISO menjadi lebih mudah dibaca, misal "20/11/2026 14.05". */
function formatTanggal(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showHelp() {
  console.log(`
Penggunaan: node todo.js <perintah> [argumen]

Perintah:
  add "judul tugas"   Menambah tugas baru
  list                Menampilkan semua tugas
  done <nomor>        Menandai tugas sebagai selesai
  delete <nomor>      Menghapus tugas
  clear               Menghapus semua tugas yang sudah selesai
  help                Menampilkan bantuan ini

Contoh:
  node todo.js add "Belajar Express"
  node todo.js list
  node todo.js done 1
`);
}

// ---------------------------------------------------------------------------
// Bagian 3: Fungsi untuk setiap perintah
// ---------------------------------------------------------------------------

function addTodo(args) {
  // Gabungkan semua argumen, jadi `add Belajar Express` (tanpa tanda kutip) juga bisa
  const judul = args.join(' ').trim();

  if (!judul) {
    exitWithError('Judul tugas tidak boleh kosong. Contoh: node todo.js add "Belajar Express"');
  }

  const todos = loadTodos();

  // Struktur satu tugas: id, judul, status selesai, dan tanggal dibuat
  const tugasBaru = {
    id: generateId(todos),
    judul: judul,
    selesai: false,
    dibuat: new Date().toISOString(), // format standar, mudah disimpan & dibaca ulang
  };

  todos.push(tugasBaru);
  saveTodos(todos);

  console.log(`Tugas ditambahkan: "${judul}" (nomor ${todos.length})`);
}

function listTodos() {
  const todos = loadTodos();

  if (todos.length === 0) {
    console.log('Belum ada tugas. Tambahkan dengan: node todo.js add "judul tugas"');
    return;
  }

  console.log('Daftar Tugas:');
  todos.forEach((t, index) => {
    const status = t.selesai ? '[x]' : '[ ]';
    console.log(`${index + 1}. ${status} ${t.judul}  (dibuat: ${formatTanggal(t.dibuat)})`);
  });

  // Ringkasan kecil di bagian bawah
  const jumlahSelesai = todos.filter((t) => t.selesai).length;
  console.log(`\n${jumlahSelesai} dari ${todos.length} tugas selesai.`);
}

function doneTodo(args) {
  const todos = loadTodos();
  const index = parseNomor(args[0], todos);
  const tugas = todos[index];

  if (tugas.selesai) {
    console.log(`Tugas nomor ${index + 1} ("${tugas.judul}") sudah ditandai selesai sebelumnya.`);
    return;
  }

  tugas.selesai = true;
  saveTodos(todos);
  console.log(`Tugas nomor ${index + 1} selesai: "${tugas.judul}"`);
}

function deleteTodo(args) {
  const todos = loadTodos();
  const index = parseNomor(args[0], todos);

  // splice(index, 1) menghapus 1 elemen di posisi index dan mengembalikannya dalam array
  const [terhapus] = todos.splice(index, 1);
  saveTodos(todos);

  console.log(`Tugas dihapus: "${terhapus.judul}"`);
}

function clearDone() {
  const todos = loadTodos();

  // filter() membuat array baru yang hanya berisi tugas yang BELUM selesai
  const sisa = todos.filter((t) => !t.selesai);
  const jumlahDihapus = todos.length - sisa.length;

  if (jumlahDihapus === 0) {
    console.log('Tidak ada tugas selesai yang perlu dihapus.');
    return;
  }

  saveTodos(sisa);
  console.log(`${jumlahDihapus} tugas selesai telah dihapus.`);
}

// ---------------------------------------------------------------------------
// Bagian 4: Program utama — membaca perintah dari terminal
// ---------------------------------------------------------------------------

// process.argv berisi: [path node, path todo.js, ...argumen pengguna]
// slice(2) mengambil argumen pengguna saja, misal ['add', 'Belajar Express']
const [perintah, ...args] = process.argv.slice(2);

switch (perintah) {
  case 'add':
    addTodo(args);
    break;
  case 'list':
    listTodos();
    break;
  case 'done':
    doneTodo(args);
    break;
  case 'delete':
    deleteTodo(args);
    break;
  case 'clear':
    clearDone();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  case undefined:
    // Tidak ada perintah sama sekali
    console.error('Error: Perintah belum diberikan.');
    showHelp();
    process.exit(1);
  default:
    console.error(`Error: Perintah "${perintah}" tidak dikenal.`);
    showHelp();
    process.exit(1);
}
