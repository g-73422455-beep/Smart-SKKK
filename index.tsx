
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  ClipboardCheck, 
  Calendar, 
  ShieldCheck, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  School,
  CheckCircle2,
  Users,
  Lock,
  Plus,
  Trash2,
  X,
  Settings,
  Printer,
  Upload,
  ImageIcon,
  RefreshCcw,
  BarChart3,
  UserCheck,
  Sparkle,
  MapPin,
  Trophy,
  History,
  Archive,
  Edit,
  FileText,
  AlertCircle,
  Eye,
  TrendingUp,
  LayoutDashboard,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// --- TYPES ---
export interface DailyReport {
  day: string;
  activities: string;
  incidents: string;
  isSchoolDay: boolean;
}

export interface DailyAttendance {
  day: string;
  total: number;
  present: number;
  absent: number;
}

export interface DailyTeacherStatus {
  day: string;
  status: 'Hadir' | 'Tidak Hadir';
  reason?: string;
}

export interface TeacherAttendanceRecord {
  name: string;
  dailyStatuses: DailyTeacherStatus[];
}

export interface ReportData {
  teachers: string[];
  weekNumber: string;
  dateStart: string;
  dateEnd: string;
  theme: string;
  teacherAttendance: TeacherAttendanceRecord[];
  attendance: DailyAttendance[];
  dailyReports: DailyReport[];
  cleanlinessScore: number;
  locationScores: Record<string, number>;
  cleanlinessNotes: string;
  cleanlinessWinners: {
    preschool: string;
    level1: string;
    level2: string;
  };
  safetyStatus: string;
  disciplineSummary: string;
  additionalNotes: string;
}

export interface SavedReport {
  id: string;
  timestamp: number;
  year: string;
  week: string;
  dateRange: string;
  data: ReportData;
  aiContent: string;
}

export enum FormStep {
  BasicInfo = 1,
  TeacherAttendance = 2,
  StudentAttendance = 3,
  DailyActivities = 4,
  Cleanliness = 5,
  SafetyDiscipline = 6,
  Review = 7
}

// --- CONSTANTS ---
const DAYS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];
const DEFAULT_LOGO = "https://lh3.googleusercontent.com/d/19dkOf5D6na0TaJsfkaB_C66la37HsVsf";
const CLEANLINESS_LOCATIONS = ["KANTIN", "BILIK GURU", "TANDAS MURID LELAKI", "TANDAS MURID PEREMPUAN", "TANDAS GURU LELAKI", "TANDAS GURU PEREMPUAN", "PADANG SEKOLAH", "PRA RIZQY", "PRA BAIHAQY", "1 RIZQY", "1 BAIHAQY", "2 RIZQY", "2 BAIHAQY", "3 RIZQY", "3 BAIHAQY", "4 RIZQY", "4 BAIHAQY", "5 RIZQY", "5 BAIHAQY", "6 RIZQY", "6 BAIHAQY"];
const CLASSES_PRESCHOOL = ["PRA RIZQY", "PRA BAIHAQY"];
const CLASSES_LEVEL1 = ["1 RIZQY", "1 BAIHAQY", "2 RIZQY", "2 BAIHAQY", "3 RIZQY", "3 BAIHAQY"];
const CLASSES_LEVEL2 = ["4 RIZQY", "4 BAIHAQY", "5 RIZQY", "5 BAIHAQY", "6 RIZQY", "6 BAIHAQY"];
const COMMON_ABSENCE_REASONS = ["Cuti Rehat Khas (CRK)", "Cuti Sakit (MC)", "Kursus / Bengkel / Mesyuarat Luar", "Tugasan Rasmi Luar (Sukan/Ko-kurikulum)", "Cuti Kuarantin", "Cuti Tanpa Gaji / Cuti Separuh Gaji", "Urusan Peribadi / Kecemasan", "Cuti Umrah / Keagamaan", "Cuti Bersalin"];

const ACADEMIC_CALENDAR_2026 = [
  { start: '2026-01-11', week: '1', theme: '-' },
  { start: '2026-01-18', week: '2', theme: 'BERTANGGUNGJAWAB' },
  { start: '2026-01-25', week: '3', theme: '-' },
  { start: '2026-02-01', week: '4', theme: '-' },
  { start: '2026-02-08', week: '5', theme: '-' },
  { start: '2026-02-15', week: '6', theme: '-' },
  { start: '2026-02-22', week: '7', theme: 'KEGEMBIRAAN' },
  { start: '2026-03-01', week: '8', theme: '-' },
  { start: '2026-03-08', week: '9', theme: '-' },
  { start: '2026-03-15', week: '10', theme: '-' },
  { start: '2026-03-22', week: 'CUTI', theme: 'CUTI PENGGAL 1' },
  { start: '2026-03-29', week: '11', theme: '-' },
  { start: '2026-04-05', week: '12', theme: '-' },
  { start: '2026-04-12', week: '13', theme: '-' },
  { start: '2026-04-19', week: '14', theme: 'HORMAT MENGHORMATI' },
  { start: '2026-04-26', week: '15', theme: '-' },
  { start: '2026-05-03', week: '16', theme: '-' },
  { start: '2026-05-10', week: '17', theme: '-' },
  { start: '2026-05-17', week: '18', theme: 'BERTANGGUNGJAWAB' },
  { start: '2026-05-24', week: 'CUTI', theme: 'CUTI PERTENGAHAN TAHUN' },
  { start: '2026-06-07', week: '19', theme: '-' },
  { start: '2026-06-14', week: '20', theme: '-' },
  { start: '2026-06-21', week: '21', theme: 'KEGEMBIRAAN' },
  { start: '2026-06-28', week: '22', theme: '-' },
  { start: '2026-07-05', week: '23', theme: '-' },
  { start: '2026-07-12', week: '24', theme: '-' },
  { start: '2026-07-19', week: '25', theme: 'KASIH SAYANG' },
  { start: '2026-07-26', week: '26', theme: '-' },
  { start: '2026-08-02', week: '27', theme: '-' },
  { start: '2026-08-09', week: '28', theme: '-' },
  { start: '2026-08-16', week: '29', theme: '-' },
  { start: '2026-08-23', week: '30', theme: 'HORMAT MENGHORMATI' },
  { start: '2026-08-30', week: 'CUTI', theme: 'CUTI PENGGAL 2' },
  { start: '2026-09-06', week: '31', theme: '-' },
  { start: '2026-09-13', week: '32', theme: '-' },
  { start: '2026-09-20', week: '33', theme: 'BERTANGGUNGJAWAB' },
  { start: '2026-09-27', week: '34', theme: '-' },
  { start: '2026-10-04', week: '35', theme: '-' },
  { start: '2026-10-11', week: '36', theme: '-' },
  { start: '2026-10-18', week: '37', theme: 'KEGEMBIRAAN' },
  { start: '2026-10-25', week: '38', theme: '-' },
  { start: '2026-11-01', week: '39', theme: '-' },
  { start: '2026-11-08', week: '40', theme: '-' },
  { start: '2026-11-15', week: '41', theme: '-' },
  { start: '2026-11-22', week: '42', theme: 'KASIH SAYANG' },
  { start: '2026-11-29', week: '43', theme: '-' },
  { start: '2026-12-06', week: 'CUTI', theme: 'CUTI A.TAHUN 2026' },
];

const DEFAULT_TEACHERS = ["HASNAH BINTI JAMALUDDIN", "SABRI BIN SAAT", "SITI MASTURA BINTI GHANI", "JAMALUDDIN BIN MOHAMED @ ALIAS", "AMIRUN IKMAL BIN KUSAINI", "AMMIRUL SHAFIQ BIN NOR AZMAN", "BORHANUDIN BIN ABDULLAH", "ELIZE LEE", "ATIQAH BINTI MOHAMED HETHDZIR", "HALMIAH BINTI SURATMAN", "HANIS AZIDA BINTI MOHD AZHAR", "HARNIMIZAM BIN ABD HAMID", "HASBIAH BINTI AWANG @ HASSAN", "MOHD FAYED BIN NURUL HUDA", "MOHD NOORKHAIRIZAM B MOHD YUSOF", "MOHD SHAHRIL B SAMAD", "MOHD SHAMSUL KAMAL B ISHAK", "MUHAMAD SYAFIQ BIN MD NASIR", "ALESSANDRA YONG MOI CHIN", "NUR ARIF BIN KAMAL", "ROSDA BINTI MAHAT @ KASSIM", "ROSMINAH BT MOHD NOR", "RUSNANI BINTI JAAFAR", "SITI HANISAH BINTI SHIKH NORDIN", "JAMILAH BINTI MONIL", "SOPHIAH BINTI AHMAD @ AHMAT", "SITI NORMAZIANA BINTI ABDUL RAHMAN", "NORARIZZA BINTI MOHD AMIN", "KAUSALYAH A/P NADARAJAH", "NUR IMAN ATIQAH BINTI BASREE", "MUHAMMAD SHRIZAN BIN ZAINAL ABIDIN", "MUHAMMAD IKRAM BIN NIZA RUDDIN"].sort();

// --- GEMINI SERVICE ---
const generateProfessionalReport = async (data: ReportData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const teachersList = data.teachers.filter(t => t.trim() !== '').join(', ');
  const winnersText = `PEMENANG KEBERSIHAN MINGGUAN:\n- Prasekolah: ${data.cleanlinessWinners.preschool || 'Tiada'}\n- Tahap 1: ${data.cleanlinessWinners.level1 || 'Tiada'}\n- Tahap 2: ${data.cleanlinessWinners.level2 || 'Tiada'}`;
  
  const teacherAttendanceDetails = data.teacherAttendance.map(t => {
    const absences = t.dailyStatuses.filter(s => s.status === 'Tidak Hadir').map(s => `${s.day} (Sebab: ${s.reason || 'Tiada sebab'})`).join(', ');
    return absences ? `- ${t.name}: Tidak hadir pada ${absences}` : null;
  }).filter(t => t !== null).join('\n');

  const prompt = `Bertindak sebagai Setiausaha Kokurikulum atau Guru Kanan di SK Kuala Klawang (NBA0003).
    Berdasarkan data mentah laporan berikut, hasilkan laporan rasmi profesional dalam Bahasa Melayu.
    
    MAKLUMAT ASAS:
    - Guru Bertugas: ${teachersList}
    - Minggu: ${data.weekNumber}
    - Tarikh: ${data.dateStart} - ${data.dateEnd}
    - Tema: ${data.theme}
    - Kehadiran Guru: ${teacherAttendanceDetails || 'Semua hadir penuh.'}
    - Kehadiran Murid: ${data.attendance.map(a => `${a.day}: ${a.present}/${a.total}`).join(', ')}
    - Laporan Harian: ${data.dailyReports.map(dr => `${dr.day}: ${dr.isSchoolDay ? dr.activities : 'CUTI'}`).join('\n')}
    - Kebersihan (${data.cleanlinessScore}/10): ${data.cleanlinessNotes}
    ${winnersText}
    - Keselamatan/Disiplin: ${data.safetyStatus}. ${data.disciplineSummary}
    - Nota Tambahan: ${data.additionalNotes}

    Hasilkan teks laporan rasmi yang tersusun tanpa sebarang ruang tandatangan di hujung. Gunakan bahasa Melayu formal.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal menghasilkan rumusan.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ralat teknikal AI.";
  }
};

// --- APP COMPONENT ---
const App: React.FC = () => {
  const [step, setStep] = useState<FormStep>(FormStep.BasicInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminTab, setAdminTab] = useState<'profile' | 'teachers' | 'history'>('profile');
  const [teachersList, setTeachersList] = useState<string[]>([]);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState<string>(DEFAULT_LOGO);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialLocationScores = CLEANLINESS_LOCATIONS.reduce((acc, loc) => ({ ...acc, [loc]: 8 }), {});
  const [formData, setFormData] = useState<ReportData>({
    teachers: ['', '', '', ''],
    weekNumber: '',
    dateStart: '',
    dateEnd: '',
    theme: '',
    teacherAttendance: [],
    attendance: DAYS.map(day => ({ day, total: 0, present: 0, absent: 0 })),
    dailyReports: DAYS.map(day => ({ day, activities: '', incidents: '', isSchoolDay: true })),
    cleanlinessScore: 8,
    locationScores: initialLocationScores,
    cleanlinessNotes: '',
    cleanlinessWinners: { preschool: '', level1: '', level2: '' },
    safetyStatus: 'Memuaskan',
    disciplineSummary: '',
    additionalNotes: ''
  });

  useEffect(() => {
    const savedTeachers = localStorage.getItem('skkk_teachers');
    const list = savedTeachers ? JSON.parse(savedTeachers) : DEFAULT_TEACHERS;
    setTeachersList(list);
    setFormData(prev => ({ ...prev, teacherAttendance: list.map((name: string) => ({ name, dailyStatuses: DAYS.map(day => ({ day, status: 'Hadir' })) })) }));
    const savedLogo = localStorage.getItem('skkk_logo');
    if (savedLogo) setSchoolLogo(savedLogo);
    const history = localStorage.getItem('skkk_reports_history');
    if (history) setSavedReports(JSON.parse(history));
  }, []);

  const handleInputChange = (field: keyof ReportData, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleDateStartChange = (value: string) => {
    const matchingWeek = [...ACADEMIC_CALENDAR_2026].reverse().find(entry => entry.start <= value);
    let updated: any = { dateStart: value };
    if (matchingWeek) {
      updated.weekNumber = matchingWeek.week;
      updated.theme = matchingWeek.theme === '-' ? '' : matchingWeek.theme;
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4);
      updated.dateEnd = endDate.toISOString().split('T')[0];
    }
    setFormData(prev => ({ ...prev, ...updated }));
  };

  const handleTeacherChange = (index: number, value: string) => {
    const newTeachers = [...formData.teachers];
    newTeachers[index] = value;
    setFormData(prev => ({ ...prev, teachers: newTeachers }));
  };

  const handleTeacherAttendanceChange = (tIdx: number, dIdx: number, field: keyof DailyTeacherStatus, value: any) => {
    const newAttendance = [...formData.teacherAttendance];
    const record = { ...newAttendance[tIdx] };
    const statuses = [...record.dailyStatuses];
    statuses[dIdx] = { ...statuses[dIdx], [field]: value };
    if (field === 'status' && value === 'Hadir') statuses[dIdx].reason = '';
    record.dailyStatuses = statuses;
    newAttendance[tIdx] = record;
    setFormData(prev => ({ ...prev, teacherAttendance: newAttendance }));
  };

  const handleAttendanceChange = (idx: number, field: keyof DailyAttendance, value: string) => {
    const newAtt = [...formData.attendance];
    const num = parseInt(value) || 0;
    newAtt[idx] = { ...newAtt[idx], [field]: num };
    if (field === 'total' || field === 'present') newAtt[idx].absent = Math.max(0, (newAtt[idx].total || 0) - (newAtt[idx].present || 0));
    setFormData(prev => ({ ...prev, attendance: newAtt }));
  };

  const handleDailyReportChange = (idx: number, field: keyof DailyReport, value: any) => {
    const newReports = [...formData.dailyReports];
    newReports[idx] = { ...newReports[idx], [field]: value };
    setFormData(prev => ({ ...prev, dailyReports: newReports }));
  };

  const handleLocationScoreChange = (loc: string, score: number) => {
    const newScores = { ...formData.locationScores, [loc]: score };
    const values = Object.values(newScores) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / CLEANLINESS_LOCATIONS.length;
    setFormData(prev => ({ ...prev, locationScores: newScores, cleanlinessScore: Math.round(avg) }));
  };

  const handleWinnerChange = (cat: keyof ReportData['cleanlinessWinners'], val: string) => setFormData(prev => ({ ...prev, cleanlinessWinners: { ...prev.cleanlinessWinners, [cat]: val } }));

  const generateReportAction = async () => {
    setIsSubmitting(true);
    const result = await generateProfessionalReport(formData);
    setAiReport(result);
    setIsSubmitting(false);
    
    // Simpan ke sejarah
    const reportToSave: SavedReport = { 
      id: Date.now().toString(), 
      timestamp: Date.now(), 
      year: new Date(formData.dateStart).getFullYear().toString() || "2026", 
      week: formData.weekNumber, 
      dateRange: `${formData.dateStart} - ${formData.dateEnd}`, 
      data: formData, 
      aiContent: result 
    };
    const updatedHistory = [reportToSave, ...savedReports];
    setSavedReports(updatedHistory);
    localStorage.setItem('skkk_reports_history', JSON.stringify(updatedHistory));
  };

  const addTeacher = () => {
    if (newTeacherName.trim()) {
      const newList = [...teachersList, newTeacherName.trim()].sort();
      setTeachersList(newList);
      localStorage.setItem('skkk_teachers', JSON.stringify(newList));
      setNewTeacherName('');
    }
  };

  const removeTeacher = (name: string) => {
    const newList = teachersList.filter(t => t !== name);
    setTeachersList(newList);
    localStorage.setItem('skkk_teachers', JSON.stringify(newList));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSchoolLogo(base64);
        localStorage.setItem('skkk_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const averageAttendancePercent = Math.round(formData.attendance.reduce((acc, a) => acc + (a.present / (a.total || 1)), 0) / 5 * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0 font-inter">
      <header className="bg-white border-b-4 border-indigo-700 py-6 px-4 shadow-sm mb-8 print:border-b-2 print:mb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <img src={schoolLogo} alt="Logo" className="w-20 h-24 object-contain" />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">SK KUALA KLAWANG</h1>
              <p className="text-indigo-600 font-bold text-[10px] tracking-widest mt-1 uppercase">NBA 0003 | Sekolah Transformasi 2025</p>
            </div>
          </div>
          <button onClick={() => setShowAdminModal(true)} className="p-3 hover:bg-slate-100 rounded-full transition-all print:hidden" title="Tetapan & Sejarah">
            <Settings className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 print:px-0">
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-10 overflow-x-auto pb-4 print:hidden">
          {[1,2,3,4,5,6,7].map(s => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${step >= s ? 'text-indigo-600' : 'text-slate-300'}`}>L{s}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 print:shadow-none print:border-none print:p-0">
          {step === FormStep.BasicInfo && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800"><Users className="w-5 h-5 text-indigo-600"/> Guru Bertugas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                {formData.teachers.map((name, idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-bold text-indigo-600 uppercase">Guru Bertugas {idx + 1}</label>
                    <select value={name} onChange={(e) => handleTeacherChange(idx, e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white mt-1 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Pilih Nama Guru --</option>
                      {teachersList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 pt-4"><Calendar className="w-5 h-5 text-indigo-600"/> Maklumat Minggu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-sm font-semibold text-slate-700">Tarikh Mula</label><input type="date" value={formData.dateStart} onChange={(e) => handleDateStartChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="text-sm font-semibold text-slate-700">Minggu Ke-</label><input type="text" value={formData.weekNumber} onChange={(e) => handleInputChange('weekNumber', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-slate-50 mt-1 font-black text-indigo-600" /></div>
                <div className="md:col-span-2"><label className="text-sm font-semibold text-slate-700">Tema Mingguan</label><input type="text" value={formData.theme} onChange={(e) => handleInputChange('theme', e.target.value)} className="w-full px-4 py-2 border rounded-lg mt-1 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Bertanggungjawab" /></div>
              </div>
            </div>
          )}

          {step === FormStep.TeacherAttendance && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-600"/> Kehadiran Guru</h2>
              <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                <table className="w-full text-xs">
                  <thead className="bg-indigo-600 text-white"><tr><th className="p-4 text-left font-black uppercase">Guru</th>{DAYS.map(d => <th key={d} className="p-4 text-center">{d}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.teacherAttendance.map((rec, tIdx) => (
                      <tr key={tIdx} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{rec.name}</td>
                        {rec.dailyStatuses.map((s, dIdx) => (
                          <td key={dIdx} className="p-2 min-w-[120px]">
                            <select value={s.status} onChange={(e) => handleTeacherAttendanceChange(tIdx, dIdx, 'status', e.target.value as any)} className={`w-full text-[10px] font-black border rounded p-1.5 ${s.status === 'Hadir' ? 'text-green-600 border-green-100' : 'text-red-500 border-red-100 bg-red-50'}`}>
                              <option value="Hadir">HADIR</option>
                              <option value="Tidak Hadir">TIDAK HADIR</option>
                            </select>
                            {s.status === 'Tidak Hadir' && (
                              <select value={s.reason} onChange={(e) => handleTeacherAttendanceChange(tIdx, dIdx, 'reason', e.target.value)} className="w-full text-[9px] mt-1 border rounded p-1">
                                <option value="">-- SEBAB --</option>
                                {COMMON_ABSENCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === FormStep.StudentAttendance && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600"/> Kehadiran Murid</h2>
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full border-collapse">
                  <thead><tr className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest text-left"><th className="p-4">Hari</th><th className="p-4">Enrolmen</th><th className="p-4">Hadir</th><th className="p-4">Tidak Hadir</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.attendance.map((a, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30">
                        <td className="p-4 font-bold text-slate-700">{a.day}</td>
                        <td className="p-4"><input type="number" value={a.total || ''} onChange={(e) => handleAttendanceChange(i, 'total', e.target.value)} className="w-full border rounded-lg p-2 text-center font-bold" /></td>
                        <td className="p-4"><input type="number" value={a.present || ''} onChange={(e) => handleAttendanceChange(i, 'present', e.target.value)} className="w-full border rounded-lg p-2 text-center font-bold text-green-600" /></td>
                        <td className="p-4 text-center text-red-500 font-black text-lg">{a.absent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === FormStep.DailyActivities && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800"><Clock className="w-5 h-5 text-indigo-600"/> Peristiwa & Aktiviti</h2>
              {formData.dailyReports.map((dr, i) => (
                <div key={i} className={`p-5 border rounded-2xl transition-all ${dr.isSchoolDay ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">{dr.day}</h3>
                    <button onClick={() => handleDailyReportChange(i, 'isSchoolDay', !dr.isSchoolDay)} className="flex items-center gap-2 group">
                      <span className={`text-[10px] font-black uppercase ${dr.isSchoolDay ? 'text-indigo-600' : 'text-red-500'}`}>{dr.isSchoolDay ? 'Hari Sekolah' : 'Cuti'}</span>
                      {dr.isSchoolDay ? <ToggleRight className="text-indigo-600 w-8 h-8" /> : <ToggleLeft className="text-red-400 w-8 h-8" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Aktiviti Utama</label>
                      <textarea value={dr.activities} onChange={(e) => handleDailyReportChange(i, 'activities', e.target.value)} className="w-full p-3 border rounded-xl text-sm min-h-[80px]" disabled={!dr.isSchoolDay} placeholder="Contoh: Perhimpunan Pagi, Kursus..."/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Insiden / Hal Lain</label>
                      <textarea value={dr.incidents} onChange={(e) => handleDailyReportChange(i, 'incidents', e.target.value)} className="w-full p-3 border rounded-xl text-sm min-h-[80px]" disabled={!dr.isSchoolDay} placeholder="Murid sakit, kemalangan, dll..."/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === FormStep.Cleanliness && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2"><Sparkle className="w-5 h-5 text-indigo-600"/> Penilaian Kebersihan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-4">
                {CLEANLINESS_LOCATIONS.map(loc => (
                  <div key={loc} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><MapPin className="w-3 h-3"/> {loc}</span>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="10" value={formData.locationScores[loc]} onChange={e => handleLocationScoreChange(loc, parseInt(e.target.value))} className="w-24 accent-indigo-600" />
                      <span className="text-xs font-black text-indigo-700 w-4">{formData.locationScores[loc]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6">
                <h3 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2 uppercase tracking-tight"><Trophy className="w-5 h-5 text-amber-500" /> Pemenang Kebersihan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-amber-700 block mb-1 uppercase">Prasekolah</label>
                    <select value={formData.cleanlinessWinners.preschool} onChange={e => handleWinnerChange('preschool', e.target.value)} className="w-full p-2 border border-amber-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="">-- Pilih --</option>
                      {CLASSES_PRESCHOOL.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-amber-700 block mb-1 uppercase">Tahap 1</label>
                    <select value={formData.cleanlinessWinners.level1} onChange={e => handleWinnerChange('level1', e.target.value)} className="w-full p-2 border border-amber-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="">-- Pilih --</option>
                      {CLASSES_LEVEL1.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-amber-700 block mb-1 uppercase">Tahap 2</label>
                    <select value={formData.cleanlinessWinners.level2} onChange={e => handleWinnerChange('level2', e.target.value)} className="w-full p-2 border border-amber-200 rounded-xl text-sm font-bold shadow-sm">
                      <option value="">-- Pilih --</option>
                      {CLASSES_LEVEL2.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <textarea value={formData.cleanlinessNotes} onChange={e => handleInputChange('cleanlinessNotes', e.target.value)} className="w-full p-4 border rounded-xl text-sm" rows={3} placeholder="Ulasan kebersihan keseluruhan..." />
            </div>
          )}

          {step === FormStep.SafetyDiscipline && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600"/> Keselamatan & Disiplin</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Status Keselamatan Murid</label>
                  <select value={formData.safetyStatus} onChange={e => handleInputChange('safetyStatus', e.target.value)} className="w-full p-4 border rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Sangat Baik & Terkawal</option>
                    <option>Memuaskan</option>
                    <option>Perlu Perhatian Pihak Pentadbir</option>
                    <option>Kritikal / Berisiko</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Rumusan Disiplin / Sahsiah</label>
                  <textarea value={formData.disciplineSummary} onChange={e => handleInputChange('disciplineSummary', e.target.value)} className="w-full p-4 border rounded-xl text-sm" rows={4} placeholder="Ulasan mengenai perilaku murid, perhimpunan, dll..." />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Cadangan / Nota Tambahan</label>
                  <textarea value={formData.additionalNotes} onChange={e => handleInputChange('additionalNotes', e.target.value)} className="w-full p-4 border rounded-xl text-sm" rows={4} placeholder="Cadangan penambahbaikan untuk minggu hadapan..." />
                </div>
              </div>
            </div>
          )}

          {step === FormStep.Review && (
            <div className="space-y-8 animate-fadeIn">
              {aiReport ? (
                <div className="space-y-6">
                  <div className="p-10 border-t-8 border-indigo-700 bg-white shadow-2xl print:shadow-none font-serif leading-relaxed text-slate-900">
                    <div className="flex items-center gap-6 border-b-2 border-slate-800 pb-6 mb-8">
                      <img src={schoolLogo} alt="Logo" className="w-20 h-24 object-contain" />
                      <div className="flex-1">
                        <h3 className="text-xl font-black uppercase">SK KUALA KLAWANG (NBA0003)</h3>
                        <p className="text-sm font-bold text-indigo-700 uppercase">Sekolah Transformasi 2025</p>
                        <p className="text-[10px] text-slate-500 mt-1">Laporan Rasmi Guru Bertugas Mingguan</p>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap text-justify text-[15px]">{aiReport}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <button onClick={() => window.print()} className="flex-1 bg-slate-800 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-slate-900 transition-all"><Printer className="w-5 h-5" /> CETAK LAPORAN</button>
                    <button onClick={() => setAiReport('')} className="flex-1 bg-white border-2 border-slate-200 p-4 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all">UBAH DATA</button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-8 py-10">
                  <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner mb-2 animate-pulse">
                    <Sparkles className="w-12 h-12 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Sedia Untuk Dijana?</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">AI akan merumus semua input anda menjadi laporan profesional dalam masa beberapa saat.</p>
                  </div>
                  <button onClick={generateReportAction} disabled={isSubmitting} className="w-full max-w-md bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50">
                    {isSubmitting ? 'SEDANG MERUMUS...' : 'JANA LAPORAN AI'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100 print:hidden">
            {step > 1 && !aiReport && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                <ChevronLeft className="w-5 h-5" /> Kembali
              </button>
            )}
            <div className="flex-1" />
            {step < 7 && !aiReport && (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all group">
                {step === 6 ? 'SEMAK' : 'SETERUSNYA'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Admin Modal with Tabs */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-700 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6" />
                <h3 className="font-black text-lg">PENTADBIR (NBA0003)</h3>
              </div>
              <button onClick={() => { setShowAdminModal(false); setIsAdminAuth(false); }} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {!isAdminAuth ? (
                <div className="p-10 space-y-6 text-center">
                  <div className="bg-slate-100 p-4 rounded-full inline-block mb-2"><Lock className="w-8 h-8 text-indigo-600" /></div>
                  <h4 className="text-xl font-bold">Akses Terhad</h4>
                  <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-indigo-600" placeholder="••••••••" />
                  <button onClick={() => adminPass === 'admin@nba0003' ? setIsAdminAuth(true) : alert('Kata laluan salah!')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl">MASUK</button>
                </div>
              ) : (
                <>
                  <div className="flex bg-slate-50 border-b p-2 gap-2">
                    <button onClick={() => setAdminTab('profile')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${adminTab === 'profile' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>PROFIL</button>
                    <button onClick={() => setAdminTab('teachers')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${adminTab === 'teachers' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>GURU</button>
                    <button onClick={() => setAdminTab('history')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${adminTab === 'history' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>SEJARAH</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {adminTab === 'profile' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col items-center gap-4">
                          <img src={schoolLogo} className="w-32 h-40 object-contain border p-2 rounded-xl shadow-sm" />
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 font-bold px-6 py-2 rounded-full hover:bg-indigo-100 transition-all"><Upload className="w-4 h-4"/> Tukar Logo</button>
                        </div>
                      </div>
                    )}
                    {adminTab === 'teachers' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex gap-2">
                          <input type="text" value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} className="flex-1 border p-3 rounded-xl text-sm" placeholder="Nama Guru Baharu..." />
                          <button onClick={addTeacher} className="bg-indigo-600 text-white px-4 rounded-xl"><Plus/></button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {teachersList.map(t => (
                            <div key={t} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50">
                              <span className="text-xs font-bold text-slate-700">{t}</span>
                              <button onClick={() => removeTeacher(t)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {adminTab === 'history' && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senarai Laporan Tersimpan</span>
                           <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-xs border rounded p-1 font-bold">
                              <option value="2026">2026</option>
                              <option value="2025">2025</option>
                           </select>
                        </div>
                        {savedReports.filter(r => r.year === filterYear).map(r => (
                          <div key={r.id} className="p-4 border rounded-2xl hover:shadow-md transition-all group flex justify-between items-center">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">M{r.week}</span>
                                   <span className="text-slate-400 text-[9px] font-bold">{new Date(r.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h5 className="font-black text-slate-700 text-sm">{r.dateRange}</h5>
                             </div>
                             <button onClick={() => { setFormData(r.data); setAiReport(r.aiContent); setShowAdminModal(false); setStep(FormStep.Review); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t bg-slate-50 flex justify-center">
                    <button onClick={() => { localStorage.clear(); location.reload(); }} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">Padam Semua Data & Reset Sistem</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 text-center print:hidden z-40">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">NBA 0003 | SK KUALA KLAWANG</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
