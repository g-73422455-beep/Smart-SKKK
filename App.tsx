
import React, { useState, useEffect, useRef } from 'react';
// Added missing ReactDOM import
import ReactDOM from 'react-dom/client';
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
  Save,
  FileText,
  AlertCircle,
  Eye,
  TrendingUp,
  LayoutDashboard,
  Clock,
  ToggleLeft,
  ToggleRight,
  Download,
  Share2
} from 'lucide-react';
import { FormStep, ReportData, DailyReport, DailyAttendance, TeacherAttendanceRecord, SavedReport, DailyTeacherStatus } from './types';
import { generateProfessionalReport } from './services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat'];

const CLEANLINESS_LOCATIONS = [
  "KANTIN",
  "BILIK GURU",
  "TANDAS MURID LELAKI",
  "TANDAS MURID PEREMPUAN",
  "TANDAS GURU LELAKI",
  "TANDAS GURU PEREMPUAN",
  "PADANG SEKOLAH",
  "PRA RIZQY",
  "PRA BAIHAQY",
  "1 RIZQY",
  "1 BAIHAQY",
  "2 RIZQY",
  "2 BAIHAQY",
  "3 RIZQY",
  "3 BAIHAQY",
  "4 RIZQY",
  "4 BAIHAQY",
  "5 RIZQY",
  "5 BAIHAQY",
  "6 RIZQY",
  "6 BAIHAQY"
];

const CLASSES_PRESCHOOL = ["PRA RIZQY", "PRA BAIHAQY"];
const CLASSES_LEVEL1 = ["1 RIZQY", "1 BAIHAQY", "2 RIZQY", "2 BAIHAQY", "3 RIZQY", "3 BAIHAQY"];
const CLASSES_LEVEL2 = ["4 RIZQY", "4 BAIHAQY", "5 RIZQY", "5 BAIHAQY", "6 RIZQY", "6 BAIHAQY"];

const COMMON_ABSENCE_REASONS = [
  "Cuti Rehat Khas (CRK)",
  "Cuti Sakit (MC)",
  "Kursus / Bengkel / Mesyuarat Luar",
  "Tugasan Rasmi Luar (Sukan/Ko-kurikulum)",
  "Cuti Kuarantin",
  "Cuti Tanpa Gaji / Cuti Separuh Gaji",
  "Urusan Peribadi / Kecemasan",
  "Cuti Umrah / Keagamaan",
  "Cuti Bersalin"
];

const DEFAULT_LOGO = "https://lh3.googleusercontent.com/d/19dkOf5D6na0TaJsfkaB_C66la37HsVsf";

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

const DEFAULT_TEACHERS = [
  "HASNAH BINTI JAMALUDDIN", "SABRI BIN SAAT", "SITI MASTURA BINTI GHANI",
  "JAMALUDDIN BIN MOHAMED @ ALIAS", "AMIRUN IKMAL BIN KUSAINI",
  "AMMIRUL SHAFIQ BIN NOR AZMAN", "BORHANUDIN BIN ABDULLAH", "ELIZE LEE",
  "ATIQAH BINTI MOHAMED HETHDZIR", "HALMIAH BINTI SURATMAN",
  "HANIS AZIDA BINTI MOHD AZHAR", "HARNIMIZAM BIN ABD HAMID",
  "HASBIAH BINTI AWANG @ HASSAN", "MOHD FAYED BIN NURUL HUDA",
  "MOHD NOORKHAIRIZAM B MOHD YUSOF", "MOHD SHAHRIL B SAMAD",
  "MOHD SHAMSUL KAMAL B ISHAK", "MUHAMAD SYAFIQ BIN MD NASIR",
  "ALESSANDRA YONG MOI CHIN", "NUR ARIF BIN KAMAL", "ROSDA BINTI MAHAT @ KASSIM",
  "ROSMINAH BT MOHD NOR", "RUSNANI BINTI JAAFAR",
  "SITI HANISAH BINTI SHIKH NORDIN", "JAMILAH BINTI MONIL",
  "SOPHIAH BINTI AHMAD @ AHMAT", "SITI NORMAZIANA BINTI ABDUL RAHMAN",
  "NORARIZZA BINTI MOHD AMIN", "KAUSALYAH A/P NADARAJAH",
  "NUR IMAN ATIQAH BINTI BASREE", "MUHAMMAD SHRIZAN BIN ZAINAL ABIDIN",
  "MUHAMMAD IKRAM BIN NIZA RUDDIN"
].sort();

const App: React.FC = () => {
  const [step, setStep] = useState<FormStep>(FormStep.BasicInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Admin States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminTab, setAdminTab] = useState<'profile' | 'teachers' | 'history'>('profile');
  const [teachersList, setTeachersList] = useState<string[]>([]);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState<string>(DEFAULT_LOGO);
  
  // History States
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
    cleanlinessWinners: {
      preschool: '',
      level1: '',
      level2: ''
    },
    safetyStatus: 'Memuaskan',
    disciplineSummary: '',
    additionalNotes: ''
  });

  useEffect(() => {
    const savedTeachers = localStorage.getItem('skkk_teachers');
    const list = savedTeachers ? JSON.parse(savedTeachers) : DEFAULT_TEACHERS;
    setTeachersList(list);
    if (!savedTeachers) {
      localStorage.setItem('skkk_teachers', JSON.stringify(DEFAULT_TEACHERS));
    }

    setFormData(prev => ({
      ...prev,
      teacherAttendance: list.map((name: string) => ({ 
        name, 
        dailyStatuses: DAYS.map(day => ({ day, status: 'Hadir' })) 
      }))
    }));

    const savedLogo = localStorage.getItem('skkk_logo');
    if (savedLogo) {
      setSchoolLogo(savedLogo);
    }

    const history = localStorage.getItem('skkk_reports_history');
    if (history) {
      setSavedReports(JSON.parse(history));
    }
  }, []);

  const handleInputChange = (field: keyof ReportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateStartChange = (value: string) => {
    const matchingWeek = [...ACADEMIC_CALENDAR_2026]
      .reverse()
      .find(entry => entry.start <= value);

    let updatedFields: Partial<ReportData> = { dateStart: value };

    if (matchingWeek) {
      updatedFields.weekNumber = matchingWeek.week;
      updatedFields.theme = matchingWeek.theme === '-' ? '' : matchingWeek.theme;
      
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4);
      updatedFields.dateEnd = endDate.toISOString().split('T')[0];
    }

    setFormData(prev => ({ ...prev, ...updatedFields }));
  };

  const handleTeacherChange = (index: number, value: string) => {
    const newTeachers = [...formData.teachers];
    newTeachers[index] = value;
    setFormData(prev => ({ ...prev, teachers: newTeachers }));
  };

  const handleTeacherAttendanceChange = (teacherIndex: number, dayIndex: number, field: keyof DailyTeacherStatus, value: any) => {
    const newAttendance = [...formData.teacherAttendance];
    const teacherRecord = { ...newAttendance[teacherIndex] };
    const dailyStatuses = [...teacherRecord.dailyStatuses];
    
    dailyStatuses[dayIndex] = { ...dailyStatuses[dayIndex], [field]: value };
    
    if (field === 'status' && value === 'Hadir') {
      dailyStatuses[dayIndex].reason = '';
    }
    
    teacherRecord.dailyStatuses = dailyStatuses;
    newAttendance[teacherIndex] = teacherRecord;
    setFormData(prev => ({ ...prev, teacherAttendance: newAttendance }));
  };

  const handleAttendanceChange = (index: number, field: keyof DailyAttendance, value: string) => {
    const newAttendance = [...formData.attendance];
    const numValue = parseInt(value) || 0;
    const item = { ...newAttendance[index], [field]: numValue };
    
    if (field === 'total' || field === 'present') {
      item.absent = Math.max(0, item.total - item.present);
    }
    
    newAttendance[index] = item;
    setFormData(prev => ({ ...prev, attendance: newAttendance }));
  };

  const handleDailyReportChange = (index: number, field: keyof DailyReport, value: any) => {
    const newDailyReports = [...formData.dailyReports];
    newDailyReports[index] = { ...newDailyReports[index], [field]: value };
    setFormData(prev => ({ ...prev, dailyReports: newDailyReports }));
  };

  const handleLocationScoreChange = (loc: string, score: number) => {
    const newScores = { ...formData.locationScores, [loc]: score };
    const values = Object.values(newScores) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / CLEANLINESS_LOCATIONS.length;
    setFormData(prev => ({ ...prev, locationScores: newScores, cleanlinessScore: Math.round(avg) }));
  };

  const handleWinnerChange = (category: keyof ReportData['cleanlinessWinners'], value: string) => {
    setFormData(prev => ({
      ...prev,
      cleanlinessWinners: { ...prev.cleanlinessWinners, [category]: value }
    }));
  };

  const saveReportToHistory = (data: ReportData, aiContent: string) => {
    const newReport: SavedReport = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      year: new Date(data.dateStart).getFullYear().toString() || new Date().getFullYear().toString(),
      week: data.weekNumber,
      dateRange: `${data.dateStart} - ${data.dateEnd}`,
      data,
      aiContent
    };

    const updatedHistory = [newReport, ...savedReports];
    setSavedReports(updatedHistory);
    localStorage.setItem('skkk_reports_history', JSON.stringify(updatedHistory));
  };

  const generateReport = async () => {
    setIsSubmitting(true);
    const result = await generateProfessionalReport(formData);
    setAiReport(result);
    setIsSubmitting(false);
    saveReportToHistory(formData, result);
  };

  const generatePdfAction = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text("SK KUALA KLAWANG", pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text("NBA 0003 | SEKOLAH TRANSFORMASI 2025", pageWidth / 2, 28, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.line(20, 35, pageWidth - 20, 35);
      
      doc.setFontSize(14);
      doc.text(`LAPORAN GURU BERTUGAS MINGGUAN - MINGGU ${formData.weekNumber}`, pageWidth / 2, 45, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Tarikh: ${formData.dateStart} hingga ${formData.dateEnd}`, 20, 55);
      doc.text(`Tema: ${formData.theme || '-'}`, 20, 60);
      doc.text(`Guru Bertugas: ${formData.teachers.filter(t => t !== '').join(', ')}`, 20, 65);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("KANDUNGAN LAPORAN:", 20, 75);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(aiReport, pageWidth - 40);
      doc.text(splitText, 20, 85);
      
      doc.save(`Laporan_SKKK_M${formData.weekNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal menjana PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shareReportAction = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Laporan Guru Bertugas SKKK M${formData.weekNumber}`,
          text: aiReport,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Browser anda tidak menyokong fungsi perkongsian.");
    }
  };

  const deleteReport = (id: string) => {
    if (confirm('Padam laporan ini daripada sejarah?')) {
      const updatedHistory = savedReports.filter(r => r.id !== id);
      setSavedReports(updatedHistory);
      localStorage.setItem('skkk_reports_history', JSON.stringify(updatedHistory));
    }
  };

  const editSavedReport = (report: SavedReport) => {
    setFormData(report.data);
    setAiReport(report.aiContent);
    setShowAdminModal(false);
    setStep(FormStep.Review);
  };

  const sendEmail = () => {
    const schoolEmail = "skkualaklawang@moe.edu.my";
    const subject = encodeURIComponent(`Laporan Guru Bertugas Mingguan - Minggu ${formData.weekNumber} (NBA0003)`);
    const body = encodeURIComponent(aiReport || "Tiada kandungan laporan.");
    window.location.href = `mailto:${schoolEmail}?subject=${subject}&body=${body}`;
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'admin@nba0003') { 
      setIsAdminAuth(true);
      setAdminPass('');
    } else {
      alert('Kata laluan salah!');
    }
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

  const resetToDefault = () => {
    if (confirm('Padam semua perubahan dan kembalikan senarai asal?')) {
      setTeachersList(DEFAULT_TEACHERS);
      localStorage.setItem('skkk_teachers', JSON.stringify(DEFAULT_TEACHERS));
    }
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

  const resetLogo = () => {
    setSchoolLogo(DEFAULT_LOGO);
    localStorage.removeItem('skkk_logo');
  };

  const renderProgress = () => {
    const steps = [
      { id: 1, label: 'Info' },
      { id: 2, label: 'Guru' },
      { id: 3, label: 'Murid' },
      { id: 4, label: 'Aktiviti' },
      { id: 5, label: 'Kebersihan' },
      { id: 6, label: 'Disiplin' },
      { id: 7, label: 'Semak' }
    ];

    return (
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto px-4 print:hidden overflow-x-auto pb-4 sm:pb-0">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                step >= s.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <span className="text-xs sm:text-sm font-bold">{s.id}</span>}
              </div>
              <span className={`text-[9px] sm:text-[11px] mt-2 font-medium ${step >= s.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded ${step > s.id ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const filteredHistory = savedReports.filter(r => r.year === filterYear);
  const yearsInHistory = [...new Set(savedReports.map(r => r.year))].sort((a, b) => (b as string).localeCompare(a as string));

  const totalAbsences = formData.teacherAttendance.reduce((acc, t) => {
    return acc + t.dailyStatuses.filter(s => s.status === 'Tidak Hadir').length;
  }, 0);

  const averageStudentAttendance = Math.round(
    formData.attendance.reduce((acc, a) => acc + (a.present / (a.total || 1)), 0) / 5 * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      <header className="bg-white border-b-4 border-indigo-700 py-6 px-4 shadow-sm mb-8 print:border-b-2 print:mb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group">
              <img 
                src={schoolLogo} 
                alt="Logo Sekolah" 
                className="w-24 h-28 object-contain print:w-20 print:h-24 bg-slate-50 p-1 rounded-lg border border-slate-100"
                onError={(e) => { (e.target as any).src = "https://via.placeholder.com/100x120?text=LOGO"; }}
              />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-200 print:hidden">
                <School className="w-3 h-3 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none print:text-xl">SK KUALA KLAWANG</h1>
              <p className="text-indigo-600 font-bold text-[10px] sm:text-xs tracking-widest mt-1 print:text-[10px] uppercase">Sekolah Transformasi 2025 (TS25)</p>
              <div className="h-px bg-slate-200 w-full my-2 print:my-1" />
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-slate-500 font-bold text-[9px] sm:text-xs leading-relaxed">
                    NBA 0003 | 0.5KM JALAN KUALA KLAWANG - SEREMBAN, 71600 KUALA KLAWANG, JELEBU, NEGERI SEMBILAN
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAdminModal(true)}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors print:hidden flex-shrink-0"
            title="Menu Pentadbir & Sejarah"
          >
            <Settings className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 print:px-0">
        {renderProgress()}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 print:shadow-none print:border-none print:p-0">
          {step === FormStep.BasicInfo && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Maklumat Guru Bertugas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                {formData.teachers.map((name, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Guru Bertugas {idx + 1}</label>
                    <select
                      value={name}
                      onChange={(e) => handleTeacherChange(idx, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Sila Pilih Nama Guru --</option>
                      {teachersList.map((teacher, tIdx) => (
                        <option key={tIdx} value={teacher}>
                          {teacher}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 pt-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Perincian Mingguan (Takwim 2026)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tarikh Mula (Ahad/Isnin)</label>
                  <input
                    type="date"
                    value={formData.dateStart}
                    onChange={(e) => handleDateStartChange(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ring-2 ring-indigo-50 font-medium"
                  />
                  <p className="text-[10px] text-indigo-500 mt-1 font-bold italic">Sistem akan mengisi Minggu & Tema secara automatik</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tarikh Tamat</label>
                  <input
                    type="date"
                    value={formData.dateEnd}
                    onChange={(e) => handleInputChange('dateEnd', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Minggu Ke-</label>
                  <input
                    type="text"
                    value={formData.weekNumber}
                    onChange={(e) => handleInputChange('weekNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-black text-indigo-700 text-lg"
                    placeholder="M01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tema Mingguan</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700"
                    placeholder="Sila nyatakan tema jika ada"
                  />
                </div>
              </div>
            </div>
          )}

          {step === FormStep.TeacherAttendance && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Kehadiran Guru (Isnin - Jumaat)
                </h2>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                  {totalAbsences} Ketidakhadiran Dicatat
                </span>
              </div>
              
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-indigo-600 text-white">
                        <th className="p-4 text-left font-black uppercase tracking-widest text-[10px] sticky left-0 z-20 bg-indigo-600">Nama Guru</th>
                        {DAYS.map((day) => (
                          <th key={day} className="p-4 text-center font-black uppercase tracking-widest text-[10px] w-40">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.teacherAttendance.map((record, tIdx) => (
                        <tr key={record.name} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-700 sticky left-0 z-10 bg-white border-r border-slate-100">{record.name}</td>
                          {record.dailyStatuses.map((statusObj, dIdx) => (
                            <td key={dIdx} className="p-2 border-r border-slate-50">
                              <div className="space-y-2">
                                <select
                                  value={statusObj.status}
                                  onChange={(e) => handleTeacherAttendanceChange(tIdx, dIdx, 'status', e.target.value as any)}
                                  className={`w-full px-2 py-1.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-black transition-colors ${
                                    statusObj.status === 'Hadir' ? 'border-green-100 text-green-600 bg-green-50/30' : 'border-red-500 text-red-600 bg-red-50 font-black ring-2 ring-red-100'
                                  }`}
                                >
                                  <option value="Hadir">HADIR</option>
                                  <option value="Tidak Hadir" className="text-red-600 font-black uppercase">TIDAK HADIR</option>
                                </select>
                                
                                {statusObj.status === 'Tidak Hadir' && (
                                  <select
                                    value={statusObj.reason || ''}
                                    onChange={(e) => handleTeacherAttendanceChange(tIdx, dIdx, 'reason', e.target.value)}
                                    className="w-full px-2 py-1 border border-red-200 rounded-lg text-[9px] italic font-bold text-red-600 outline-none bg-white shadow-sm"
                                  >
                                    <option value="">-- SEBAB --</option>
                                    {COMMON_ABSENCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    <option value="Lain-lain">Lain-lain</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === FormStep.StudentAttendance && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Jumlah Kehadiran Murid Harian
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-700">
                      <th className="p-3 text-left font-bold border border-indigo-100">Hari</th>
                      <th className="p-3 text-center font-bold border border-indigo-100">Enrolmen</th>
                      <th className="p-3 text-center font-bold border border-indigo-100">Hadir</th>
                      <th className="p-3 text-center font-bold border border-indigo-100 text-red-600">Tidak Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.attendance.map((dayData, idx) => (
                      <tr key={dayData.day} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-700 border border-slate-100">{dayData.day}</td>
                        <td className="p-2 border border-slate-100">
                          <input
                            type="number"
                            value={dayData.total || ''}
                            onChange={(e) => handleAttendanceChange(idx, 'total', e.target.value)}
                            className="w-full px-2 py-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 border border-slate-100">
                          <input
                            type="number"
                            value={dayData.present || ''}
                            onChange={(e) => handleAttendanceChange(idx, 'present', e.target.value)}
                            className="w-full px-2 py-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3 text-center border border-slate-100 font-black text-red-600 text-lg">
                          {dayData.absent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === FormStep.DailyActivities && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Laporan Aktiviti & Peristiwa Harian
              </h2>
              <div className="space-y-6">
                {formData.dailyReports.map((report, idx) => (
                  <div key={report.day} className={`p-4 rounded-xl border transition-all ${report.isSchoolDay ? 'bg-slate-50 border-slate-200 hover:border-indigo-200' : 'bg-red-50/30 border-red-100'}`}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${report.isSchoolDay ? 'bg-indigo-600 text-white' : 'bg-red-500 text-white'}`}>
                                {report.day.substring(0,1)}
                            </div>
                            <h3 className={`font-bold ${report.isSchoolDay ? 'text-slate-700' : 'text-red-700 line-through'}`}>{report.day}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${report.isSchoolDay ? 'text-indigo-500' : 'text-red-500'}`}>
                                {report.isSchoolDay ? 'Hari Persekolahan' : 'Cuti / Tiada Persekolahan'}
                            </span>
                            <button 
                                onClick={() => handleDailyReportChange(idx, 'isSchoolDay', !report.isSchoolDay)}
                                className="transition-all hover:scale-110 active:scale-90"
                            >
                                {report.isSchoolDay ? (
                                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-red-300" />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${report.isSchoolDay ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Aktiviti Utama</label>
                        <textarea
                          value={report.isSchoolDay ? report.activities : 'CUTI / TIADA PERSEKOLAHAN'}
                          onChange={(e) => handleDailyReportChange(idx, 'activities', e.target.value)}
                          disabled={!report.isSchoolDay}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                          placeholder="Contoh: Perhimpunan rasmi, pemeriksaan kuku..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peristiwa / Kes Khas</label>
                        <textarea
                          value={report.isSchoolDay ? report.incidents : ''}
                          onChange={(e) => handleDailyReportChange(idx, 'incidents', e.target.value)}
                          disabled={!report.isSchoolDay}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px] italic"
                          placeholder="Nyatakan jika ada murid sakit atau insiden..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === FormStep.Cleanliness && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-indigo-600" />
                Penilaian Kebersihan Lokasi Sekolah
              </h2>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-indigo-600 text-white">
                        <th className="p-4 text-left font-black uppercase tracking-widest text-[10px]">Kawasan / Lokasi</th>
                        <th className="p-4 text-center font-black uppercase tracking-widest text-[10px] w-48">Skor Kebersihan (1-10)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CLEANLINESS_LOCATIONS.map((loc) => (
                        <tr key={loc} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-bold text-slate-700">{loc}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-4 justify-center">
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.locationScores[loc] || 8}
                                onChange={(e) => handleLocationScoreChange(loc, parseInt(e.target.value))}
                                className="w-full max-w-[120px] accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className={`w-8 text-center font-black text-sm ${formData.locationScores[loc] >= 8 ? 'text-green-600' : formData.locationScores[loc] >= 5 ? 'text-indigo-600' : 'text-red-500'}`}>
                                {formData.locationScores[loc]}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-indigo-50 flex items-center justify-between border-t border-indigo-100">
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Purata Skor Kebersihan:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-700">{formData.cleanlinessScore}</span>
                    <span className="text-[10px] font-bold text-indigo-400">/ 10</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-black text-amber-800 flex items-center gap-2 uppercase tracking-tight">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Pemenang Kebersihan Mingguan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Prasekolah</label>
                      <select 
                        value={formData.cleanlinessWinners.preschool}
                        onChange={(e) => handleWinnerChange('preschool', e.target.value)}
                        className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {CLASSES_PRESCHOOL.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Tahap 1</label>
                      <select 
                        value={formData.cleanlinessWinners.level1}
                        onChange={(e) => handleWinnerChange('level1', e.target.value)}
                        className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {CLASSES_LEVEL1.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Tahap 2</label>
                      <select 
                        value={formData.cleanlinessWinners.level2}
                        onChange={(e) => handleWinnerChange('level2', e.target.value)}
                        className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {CLASSES_LEVEL2.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Tambahan Mengenai Kebersihan</label>
                <textarea
                  value={formData.cleanlinessNotes}
                  onChange={(e) => handleInputChange('cleanlinessNotes', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Ulasan terperinci..."
                />
              </div>
            </div>
          )}

          {step === FormStep.SafetyDiscipline && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Keselamatan & Disiplin Murid
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Status Keselamatan Murid</label>
                      <select
                        value={formData.safetyStatus}
                        onChange={(e) => handleInputChange('safetyStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold bg-slate-50"
                      >
                        <option>Sangat Baik & Terkawal</option>
                        <option>Memuaskan</option>
                        <option>Perlu Perhatian Pihak Pentadbir</option>
                        <option>Kritikal / Berisiko</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Ringkasan Disiplin / Sahsiah</label>
                      <textarea
                        value={formData.disciplineSummary}
                        onChange={(e) => handleInputChange('disciplineSummary', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows={3}
                        placeholder="Sahsiah murid sepanjang minggu..."
                      />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Tambahan / Cadangan</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows={4}
                    placeholder="Cadangan penambahbaikan..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === FormStep.Review && (
            <div className="space-y-8 animate-fadeIn">
              {aiReport ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between print:hidden">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Laporan Digital NBA 0003
                    </h2>
                  </div>
                  
                  <div className="p-10 bg-white shadow-2xl rounded-sm border-t-8 border-indigo-700 font-serif leading-relaxed text-slate-900 print:shadow-none print:p-0 print:border-t-0 border border-slate-100">
                    <div className="flex items-center gap-6 mb-8 border-b-2 border-slate-800 pb-6 relative">
                        <img src={schoolLogo} alt="Logo" className="w-24 h-28 object-contain" />
                        <div className="flex-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">SK KUALA KLAWANG</h3>
                            <p className="text-sm font-bold text-indigo-800 uppercase tracking-widest leading-none">SEKOLAH TRANSFORMASI 2025 (TS25)</p>
                            <p className="text-[11px] font-medium mt-1">NBA 0003 | 0.5KM JALAN KUALA KLAWANG - SEREMBAN, 71600 KUALA KLAWANG</p>
                            <p className="text-[10px] text-slate-500">Tel: 06-6136224 | Faks: 06-6136224 | Emel: skkualaklawang@moe.edu.my</p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h4 className="text-lg font-bold border-b-2 border-slate-200 inline-block px-4 pb-1 uppercase">LAPORAN GURU BERTUGAS MINGGUAN</h4>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-left text-sm max-w-lg mx-auto bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-200">
                            <p><span className="font-bold">MINGGU:</span> {formData.weekNumber}</p>
                            <p><span className="font-bold">TARIKH:</span> {formData.dateStart} - {formData.dateEnd}</p>
                            <p className="col-span-2"><span className="font-bold">TEMA:</span> {formData.theme || 'Tiada Tema Khusus'}</p>
                        </div>
                    </div>

                    <div className="whitespace-pre-wrap text-justify text-[15px] leading-relaxed mb-6">
                      {aiReport}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={generatePdfAction}
                        disabled={isGeneratingPdf}
                        className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {isGeneratingPdf ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        JANA PDF
                      </button>
                      
                      <button
                        onClick={shareReportAction}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                      >
                        <Share2 className="w-5 h-5" />
                        SHARE
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                      >
                        <Printer className="w-5 h-5" />
                        PRINT
                      </button>

                      <button
                        onClick={sendEmail}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                      >
                        <Send className="w-5 h-5" />
                        HANTAR EMEL
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiReport);
                          alert("Laporan telah disalin!");
                        }}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        Salin Teks
                      </button>
                      <button
                        onClick={() => setAiReport('')}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-400 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Ulang Jana Laporan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn text-center py-10">
                   <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                      <Sparkles className="w-12 h-12 text-indigo-600" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Sedia Untuk Dijana?</h2>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto">AI akan merumus semua data anda menjadi laporan profesional SKKK.</p>
                   </div>
                   <button
                      onClick={generateReport}
                      disabled={isSubmitting}
                      className={`w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-3xl text-xl shadow-2xl transition-all transform active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'MERUMUS LAPORAN...' : 'JANA LAPORAN AI'}
                    </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6 print:hidden">
            {step > 1 && !aiReport && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-2 text-slate-600 font-semibold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali
              </button>
            )}
            <div className="flex-1" />
            {step < 6 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                Seterusnya
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : step === 6 ? (
              <button
                onClick={() => setStep(FormStep.Review)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Eye className="w-5 h-5" />
                Semak Dashboard
              </button>
            ) : null}
          </div>
        </div>
      </main>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
            <div className="bg-indigo-700 p-6 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl">
                    <Lock className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-black text-lg tracking-tight">KONTROL PENTADBIR</h3>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">NBA 0003</p>
                 </div>
              </div>
              <button onClick={() => { setShowAdminModal(false); setIsAdminAuth(false); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
            {!isAdminAuth ? (
              <form onSubmit={handleAdminLogin} className="p-12 space-y-6 flex flex-col items-center justify-center flex-1">
                <div className="text-center space-y-2 mb-4">
                  <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                    <Lock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Akses Terhad Pentadbir</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Sila masukkan kata laluan sistem untuk menguruskan data sekolah.</p>
                </div>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full max-w-sm px-6 py-5 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 text-center text-2xl tracking-[0.5em] font-mono shadow-inner"
                  placeholder="••••••••"
                  autoFocus
                />
                <button type="submit" className="w-full max-w-sm bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
                  MASUK
                </button>
              </form>
            ) : (
              <>
                <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-2 flex-shrink-0">
                  <button 
                    onClick={() => setAdminTab('profile')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${adminTab === 'profile' ? 'bg-white shadow-sm text-indigo-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    PROFIL
                  </button>
                  <button 
                    onClick={() => setAdminTab('teachers')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${adminTab === 'teachers' ? 'bg-white shadow-sm text-indigo-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Users className="w-4 h-4" />
                    GURU
                  </button>
                  <button 
                    onClick={() => setAdminTab('history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${adminTab === 'history' ? 'bg-white shadow-sm text-indigo-700 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <History className="w-4 h-4" />
                    SEJARAH
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {adminTab === 'profile' && (
                    <div className="animate-fadeIn space-y-8">
                       <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                          <div className="relative group">
                            <img 
                              src={schoolLogo} 
                              alt="Logo Preview" 
                              className="w-40 h-48 object-contain bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
                            />
                            <button 
                              onClick={resetLogo}
                              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                              title="Set Semula Logo Asal"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 space-y-4 w-full text-center sm:text-left">
                            <div>
                              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Identiti SKKK</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                                Logo rasmi yang akan dipaparkan pada semua cetakan laporan e-laporan.
                              </p>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              ref={fileInputRef}
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                            >
                              <Upload className="w-5 h-5" />
                              TUKAR LOGO
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {adminTab === 'teachers' && (
                    <div className="animate-fadeIn space-y-6">
                      <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-slate-800 uppercase text-sm tracking-widest">Tambah Guru Baharu</h4>
                          <button 
                            onClick={resetToDefault}
                            className="text-[10px] text-indigo-600 font-black hover:underline tracking-tighter"
                          >
                            RESET SENARAI ASAL
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTeacherName}
                            onChange={(e) => setNewTeacherName(e.target.value)}
                            className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold uppercase"
                            placeholder="NAMA PENUH GURU..."
                          />
                          <button 
                            onClick={addTeacher}
                            className="bg-indigo-600 text-white px-6 rounded-2xl hover:bg-indigo-700 transition-all active:scale-90 shadow-lg"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                      </section>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 flex items-center justify-between px-2">
                          <span className="tracking-widest uppercase">Senarai Guru ({teachersList.length})</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {teachersList.map((teacher, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                              <span className="text-xs font-bold text-slate-700 truncate">{teacher}</span>
                              <button 
                                onClick={() => removeTeacher(teacher)}
                                className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'history' && (
                    <div className="animate-fadeIn space-y-6 h-full flex flex-col">
                      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex-shrink-0">
                         <div className="flex items-center gap-3">
                            <Archive className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-black text-indigo-900 text-sm uppercase">Rekod Laporan</h4>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase">Filter:</span>
                            <select 
                              value={filterYear}
                              onChange={(e) => setFilterYear(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-black outline-none"
                            >
                              {yearsInHistory.length > 0 ? yearsInHistory.map(y => <option key={y} value={y}>{y}</option>) : <option>{new Date().getFullYear()}</option>}
                            </select>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                         {filteredHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                               <FileText className="w-12 h-12 opacity-20" />
                               <p className="text-sm font-bold">Tiada rekod disimpan</p>
                            </div>
                         ) : (
                            filteredHistory.map(report => (
                               <div key={report.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:border-indigo-200 transition-all group">
                                  <div className="flex items-start justify-between gap-4">
                                     <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                           <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">M{report.week}</span>
                                           <span className="text-slate-400 text-[10px] font-bold">{new Date(report.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h5 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{report.dateRange}</h5>
                                     </div>
                                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => editSavedReport(report)}
                                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => deleteReport(report.id)}
                                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            ))
                         )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 px-4 text-center print:hidden z-40">
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <span>NBA0003</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>SK KUALA KLAWANG</span>
        </p>
      </footer>
    </div>
  );
};

// Fixed missing ReactDOM by adding the import at the top of the file
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
