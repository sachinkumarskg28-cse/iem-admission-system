import { User } from './user.model';

export interface GuardianDetails {
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  annualIncome?: number;
}

export interface AddressDetails {
  street?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  sameAsPresent?: boolean;
}

export interface AcademicRecord {
  board?: string;
  schoolName?: string;
  passingYear?: number;
  rollNumber?: string;
  totalMarks?: number;
  marksObtained?: number;
  percentage?: number;
  stream?: string;
  pcmPercentage?: number;
}

export interface EntranceExamDetails {
  examType?: string;
  rollNumber?: string;
  rank?: number;
  score?: number;
  examYear?: number;
}

export interface StudentProfile {
  _id: string;
  user: string | User;
  studentId: string;
  dob?: string | Date;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality?: string;
  category?: 'General' | 'OBC-A' | 'OBC-B' | 'SC' | 'ST' | 'EWS' | 'TFW';
  isPhysicallyChallenged?: boolean;
  guardian?: GuardianDetails;
  address?: {
    present?: AddressDetails;
    permanent?: AddressDetails;
  };
  academics?: {
    class10?: AcademicRecord;
    class12?: AcademicRecord;
    graduation?: any;
    entranceExam?: EntranceExamDetails;
  };
  profileCompleted: boolean;
  completionPercentage: number;
}
