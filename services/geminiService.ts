
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ReportData } from "../types";

export const generateProfessionalReport = async (data: ReportData): Promise<string> => {
  // Always use the environment variable process.env.API_KEY directly for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const teachersList = data.teachers.filter(t => t.trim() !== '').join(', ');
  
  const locationScoresText = Object.entries(data.locationScores)
    .map(([loc, score]) => `${loc}: ${score}/10`)
    .join(', ');

  const winnersText = `
    PEMENANG KEBERSIHAN MINGGUAN:
    - Prasekolah: ${data.cleanlinessWinners.preschool || 'Tiada'}
    - Tahap 1: ${data.cleanlinessWinners.level1 || 'Tiada'}
    - Tahap 2: ${data.cleanlinessWinners.level2 || 'Tiada'}
  `;

  // Format teacher attendance for the AI
  const teacherAttendanceDetails = data.teacherAttendance.map(t => {
    const absences = t.dailyStatuses
      .filter(s => s.status === 'Tidak Hadir')
      .map(s => `${s.day} (Sebab: ${s.reason || 'Tiada sebab'})`)
      .join(', ');
    return absences ? `- ${t.name}: Tidak hadir pada ${absences}` : null;
  }).filter(t => t !== null).join('\n');

  const prompt = `
    Bertindak sebagai Setiausaha Kokurikulum atau Guru Kanan di sekolah rendah Malaysia (SK Kuala Klawang).
    Berdasarkan data mentah laporan guru bertugas mingguan berikut, hasilkan satu draf laporan rasmi yang profesional, tersusun, dan menggunakan bahasa Melayu formal (bahasa surat rasmi/memo).
    
    MAKLUMAT ASAS:
    - Senarai Guru Bertugas: ${teachersList}
    - Minggu: ${data.weekNumber}
    - Tarikh: ${data.dateStart} hingga ${data.dateEnd}
    - Tema: ${data.theme}

    KEHADIRAN GURU (DAILY TRACKING ISNIN-JUMAAT):
    ${teacherAttendanceDetails || 'Semua guru hadir penuh sepanjang minggu.'}

    DATA KEHADIRAN MURID:
    ${data.attendance.map(a => `- ${a.day}: Hadir ${a.present}/${a.total} (Tidak hadir: ${a.absent})`).join('\n')}

    LAPORAN HARIAN (MENTAH):
    ${data.dailyReports.map(dr => `- ${dr.day}: ${dr.isSchoolDay ? dr.activities : 'CUTI / TIADA PERSEKOLAHAN'}. Insiden: ${dr.isSchoolDay ? dr.incidents : '-'}`).join('\n')}

    STATUS KEBERSIHAN (SKOR LOKASI):
    ${locationScoresText}
    - Skor Purata Keseluruhan: ${data.cleanlinessScore}/10
    - Catatan Kebersihan: ${data.cleanlinessNotes}
    ${winnersText}

    STATUS KESELAMATAN & DISIPLIN:
    - Status Keselamatan: ${data.safetyStatus}
    - Ringkasan Disiplin: ${data.disciplineSummary}
    
    NOTA TAMBAHAN / CADANGAN:
    ${data.additionalNotes}

    Format laporan mestilah mengandungi:
    1. Pengenalan (Guru bertugas).
    2. Makluman Kehadiran: Ulas kehadiran guru (harian) dan trend murid. Nyatakan jika ada guru yang tidak hadir pada hari-hari tertentu berserta sebabnya dengan bahasa yang sopan.
    3. Perincian harian (Isnin-Jumaat). JIKA ADA HARI CUTI, nyatakan dengan jelas sebagai cuti sekolah atau tiada persekolahan.
    4. Laporan Kebersihan: Sila ulas kebersihan kawasan sekolah. Nyatakan dengan bangga pemenang kebersihan mingguan bagi setiap kategori (Prasekolah, Tahap 1, Tahap 2).
    5. Keselamatan & Disiplin.
    6. Rumusan & Cadangan.
    
    Sila gunakan nada yang profesional dan berwibawa. JANGAN letak sebarang ruang tandatangan di hujung teks, cukup sekadar teks laporan sahaja.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal menghasilkan rumusan.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terdapat ralat teknikal semasa menghasilkan rumusan AI. Sila cuba lagi.";
  }
};
