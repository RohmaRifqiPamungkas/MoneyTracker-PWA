"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getFinancialSummary,
  getCategoryExpenses,
  getBudgetItems,
  getSavingsGoals,
  getUpcomingBills,
  getTransactions,
} from "@/lib/supabase/queries";
import type { Insight } from "@/lib/types";

export async function generateFinancialInsightsAction(
  month?: number,
  year?: number
): Promise<Insight[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Anda harus masuk terlebih dahulu.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY tidak ditemukan di environment variables.");
      // Fallback ke beberapa tips umum jika API key kosong
      return [
        {
          id: "fb-1",
          type: "info",
          message: "Hubungkan Google Gemini API Key di environment variables untuk mengaktifkan AI Insights yang personal.",
          icon: "💡",
        },
        {
          id: "fb-2",
          type: "tip",
          message: "Catat pengeluaran harian Anda secara disiplin untuk mendapatkan analisis yang akurat bulan depan.",
          icon: "✍️",
        },
        {
          id: "fb-3",
          type: "success",
          message: "MoneyTracker siap membantu Anda memantau dan mengelola alokasi anggaran dengan lebih baik.",
          icon: "🚀",
        },
      ];
    }

    // Ambil data keuangan secara paralel
    const [
      summary,
      categoryExpenses,
      budgetItems,
      savingsGoals,
      upcomingBills,
      transactions,
    ] = await Promise.all([
      getFinancialSummary(month, year),
      getCategoryExpenses(month, year),
      getBudgetItems(),
      getSavingsGoals(),
      getUpcomingBills(),
      getTransactions(month, year, 15), // Ambil 15 transaksi terakhir untuk menghemat token
    ]);

    // Format data menjadi string teks untuk prompt Gemini
    const summaryText = `
- Total Saldo: Rp ${summary.totalBalance.toLocaleString("id-ID")}
- Total Pemasukan: Rp ${summary.totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${summary.totalExpenses.toLocaleString("id-ID")}
- Tingkat Tabungan (Savings Rate): ${summary.savingsRate.toFixed(1)}%
`;

    const categoriesText = categoryExpenses.length > 0
      ? categoryExpenses
          .map(
            (c) =>
              `- ${c.label}: Rp ${c.amount.toLocaleString("id-ID")} (${c.percentage.toFixed(1)}%)`
          )
          .join("\n")
      : "Tidak ada pengeluaran terdaftar.";

    const budgetsText = budgetItems.length > 0
      ? budgetItems
          .map(
            (b) =>
              `- ${b.label}: Rp ${b.spent.toLocaleString("id-ID")} / Rp ${b.limit.toLocaleString("id-ID")} (${(
                (b.spent / (b.limit || 1)) *
                100
              ).toFixed(1)}% terpakai)`
          )
          .join("\n")
      : "Belum ada anggaran budget yang dibuat.";

    const goalsText = savingsGoals.length > 0
      ? savingsGoals
          .map(
            (g) =>
              `- ${g.name}: Terkumpul Rp ${g.current_amount.toLocaleString(
                "id-ID"
              )} dari target Rp ${g.target_amount.toLocaleString("id-ID")} (Tanggal target: ${g.target_date})`
          )
          .join("\n")
      : "Belum ada target tabungan.";

    const billsText = upcomingBills.length > 0
      ? upcomingBills
          .map(
            (bi) =>
              `- ${bi.name}: Rp ${bi.amount.toLocaleString(
                "id-ID"
              )} (Jatuh tempo: ${bi.due_date})`
          )
          .join("\n")
      : "Tidak ada tagihan mendatang terdekat.";

    const transactionsText = transactions.length > 0
      ? transactions
          .map(
            (t) =>
              `- [${t.date}] ${t.name}: ${
                t.type === "income" ? "+" : "-"
              }Rp ${t.amount.toLocaleString("id-ID")} (${t.category})`
          )
          .join("\n")
      : "Tidak ada transaksi dalam periode ini.";

    // Susun prompt instalan untuk Gemini
    const prompt = `
Kamu adalah asisten analisis keuangan cerdas terintegrasi di aplikasi MoneyTracker.
Tugas kamu adalah menganalisis data keuangan pengguna dan memberikan 4 buah insight/rekomendasi yang personal, akurat, dan sangat berguna untuk membantu mereka mengoptimalkan kondisi keuangan.

Format output HARUS berupa JSON Array berisi persis 4 objek dengan field berikut:
- type: string dengan nilai "warning", "success", "info", atau "tip" (masing-masing satu kali).
- message: string penjelasan singkat (maksimal 2 kalimat) dalam Bahasa Indonesia. Tulis nominal uang yang besar dengan format ringkas yang mudah dibaca (misal: "Rp 1,5 juta" atau "Rp 150 ribu"). Jangan pakai placeholder.
- icon: string berisi tepat satu karakter emoji yang sangat relevan dengan insight tersebut.

Definisi tipe insight:
1. "warning": Peringatan tentang pengeluaran berlebih, budget kritis (terpakai > 85%), atau kenaikan belanja tertentu yang tidak wajar.
2. "success": Apresiasi atas tabungan yang meningkat, pengeluaran yang terkendali, atau progres target tabungan yang baik.
3. "info": Analisis statistik menarik, misalnya kategori pengeluaran tertinggi minggu/bulan ini.
4. "tip": Saran aksi nyata yang taktis untuk berhemat atau menyehatkan keuangan berdasarkan data mereka.

Berikut adalah data keuangan pengguna bulan ini (Bulan: ${
      month !== undefined ? month + 1 : "saat ini"
    }, Tahun: ${year || "saat ini"}):

### Ringkasan Keuangan
${summaryText}

### Pengeluaran per Kategori
${categoriesText}

### Alokasi Anggaran (Budget)
${budgetsText}

### Target Tabungan
${goalsText}

### Tagihan Mendatang
${billsText}

### 15 Transaksi Terakhir
${transactionsText}

Hasilkan data JSON sekarang.
`;

    // Hubungi API Gemini menggunakan native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              description: "Daftar 4 insight keuangan personal",
              items: {
                type: "OBJECT",
                properties: {
                  type: {
                    type: "STRING",
                    enum: ["warning", "success", "info", "tip"],
                  },
                  message: {
                    type: "STRING",
                  },
                  icon: {
                    type: "STRING",
                  },
                },
                required: ["type", "message", "icon"],
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", response.statusText, errorData);
      const specificMessage = errorData?.error?.message || JSON.stringify(errorData);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} (${specificMessage})`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Respons AI kosong.");
    }

    const parsedInsights = JSON.parse(responseText);

    if (!Array.isArray(parsedInsights)) {
      throw new Error("Format respons AI tidak sesuai.");
    }

    // Map ke interface Insight dengan id dinamis
    return parsedInsights.map((insight: any, i: number) => ({
      id: `ai-insight-${i + 1}-${Date.now()}`,
      type: insight.type as "warning" | "success" | "info" | "tip",
      message: insight.message,
      icon: insight.icon,
    }));
  } catch (error) {
    console.error("Error generating insights:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return [
      {
        id: "err-1",
        type: "warning",
        message: `Gagal memuat analisis AI keuangan: ${errorMessage}`,
        icon: "⚠️",
      },
      {
        id: "err-2",
        type: "tip",
        message: "Periksa kembali koneksi internet, kuota API, atau validitas GEMINI_API_KEY di file .env.local Anda.",
        icon: "🔑",
      },
    ];
  }
}
