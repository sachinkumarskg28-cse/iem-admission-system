import { Course } from './course.model';
import { StudentProfile } from './student.model';
import { User } from './user.model';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_VERIFIED'
  | 'PROVISIONALLY_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FEE_PENDING'
  | 'ADMITTED'
  | 'CANCELLED';

export interface ApplicationTimeline {
  status: string;
  actorName: string;
  role: string;
  comment: string;
  timestamp: string | Date;
}

export interface Application {
  _id: string;
  applicationNumber: string;
  user: User | string;
  student: StudentProfile | string;
  course: Course;
  admissionCycle: string;
  status: ApplicationStatus;
  currentStep: number;
  isFeePaid: boolean;
  payment?: any;
  submissionDate?: string | Date;
  assignedOfficer?: User;
  officerRemarks?: string;
  rejectionReason?: string;
  decisionDate?: string | Date;
  admissionOfferLetterGenerated?: boolean;
  meritScore?: number;
  timeline: ApplicationTimeline[];
  createdAt: string | Date;
}
