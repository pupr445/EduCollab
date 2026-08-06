// Menerjemahkan pesan error teknis (biasanya dari Supabase) menjadi
// pesan berbahasa Indonesia yang ramah bagi pengguna umum (guru/siswa).

type ErrorLike = { message?: string; code?: string } | null | undefined;

const MESSAGE_MAP: Record<string, string> = {
  "Invalid login credentials": "Email atau kata sandi salah.",
  "User already registered": "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.",
  "Email not confirmed": "Email belum dikonfirmasi. Periksa kotak masuk emailmu.",
  "Password should be at least 6 characters": "Kata sandi minimal harus 6 karakter.",
  "Unable to validate email address: invalid format": "Format email tidak valid.",
  "Invalid path specified in request URL": "Terjadi kesalahan konfigurasi server. Hubungi admin aplikasi.",
  "duplicate key value violates unique constraint": "Data ini sudah ada sebelumnya.",
  "new row violates row-level security policy": "Kamu tidak memiliki izin untuk melakukan aksi ini.",
  "JWT expired": "Sesi login sudah berakhir. Silakan masuk kembali.",
  "Failed to fetch": "Gagal terhubung ke server. Periksa koneksi internetmu.",
};

const CODE_MAP: Record<string, string> = {
  "23505": "Data ini sudah ada sebelumnya (duplikat).",
  "23503": "Data ini masih terkait dengan data lain, sehingga tidak bisa dihapus.",
  "42501": "Kamu tidak memiliki izin untuk melakukan aksi ini.",
  PGRST116: "Data tidak ditemukan.",
};

export function translateError(error: ErrorLike): string {
  if (!error) return "Terjadi kesalahan yang tidak diketahui.";

  const code = (error as { code?: string }).code;
  if (code && CODE_MAP[code]) return CODE_MAP[code];

  const msg = error.message ?? "";
  for (const key in MESSAGE_MAP) {
    if (msg.includes(key)) return MESSAGE_MAP[key];
  }

  return msg || "Terjadi kesalahan. Silakan coba lagi.";
}
