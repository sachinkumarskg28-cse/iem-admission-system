export interface FeesStructure {
  admissionFee: number;
  perSemesterTuition: number;
  totalSemesters: number;
  cautionDeposit: number;
  libraryAndLabFee?: number;
  totalCourseFee: number;
}

export interface Course {
  _id: string;
  courseCode: string;
  name: string;
  department: string;
  level: 'UG' | 'PG' | 'Diploma';
  duration: string;
  eligibilityCriteria: string;
  minimumPCMPercentage?: number;
  acceptedExams?: string[];
  totalSeats: number;
  availableSeats: number;
  feesStructure: FeesStructure;
  brochureUrl?: string;
  isActive: boolean;
}
