
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
