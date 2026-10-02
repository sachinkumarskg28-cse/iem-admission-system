const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AdmissionCycle = require('../models/AdmissionCycle');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iem_admissions';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await AdmissionCycle.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seeder] Creating Admission Cycle...');
    const cycle = await AdmissionCycle.create({
      cycleCode: 'IEM-ADM-2026',
      title: 'Academic Session 2026 - 2027 Undergraduate & Postgraduate Admissions',
      academicYear: '2026-2027',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-11-30'),
      applicationFee: 2000,
      isActive: true,
      announcement: 'Admissions Open for B.Tech, BCA, MCA, BBA, and MBA programs for Batch 2026-2030.',
    });

    console.log('[Seeder] Creating Users...');
    // Admin
    const adminUser = await User.create({
      name: 'Prof. Debashis De (Dean Admissions)',
      email: 'admin@iem.edu.in',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9830012345',
      department: 'School of Engineering & Technology',
      isActive: true,
    });

    // Admission Officers
    const officerEngg = await User.create({
      name: 'Dr. Arindam Mukherjee',
      email: 'officer.engg@iem.edu.in',
      password: 'Officer@123',
      role: 'officer',
      phone: '+91 9831122334',
      department: 'School of Engineering & Technology',
      isActive: true,
    });

    const officerMgmt = await User.create({
      name: 'Dr. Sarmistha Ghosh',
      email: 'officer.mgmt@iem.edu.in',
      password: 'Officer@123',
      role: 'officer',
      phone: '+91 9832233445',
      department: 'School of Management',
      isActive: true,
    });

    // Student Users
    const studentUser1 = await User.create({
      name: 'Rahul Roy',
      email: 'student.rahul@gmail.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 9876543210',
      isActive: true,
    });

    const studentUser2 = await User.create({
      name: 'Priya Sen',
      email: 'student.priya@gmail.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 9876543211',
      isActive: true,
    });

    const studentUser3 = await User.create({
      name: 'Sneha Chakraborty',
      email: 'student.sneha@gmail.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 9876543212',
      isActive: true,
    });

    console.log('[Seeder] Creating Courses...');
    const courses = await Course.create([
      {
        courseCode: 'BTECH-CSE',
        name: 'B.Tech in Computer Science & Engineering',
        department: 'Department of Computer Science & Engineering',
        level: 'UG',
        duration: '4 Years (8 Semesters)',
        eligibilityCriteria: 'Minimum 60% in Class 12 with Physics, Mathematics, and Chemistry/CS. Valid WBJEE / JEE Main / IEMJEE rank.',
        minimumPCMPercentage: 60,
        acceptedExams: ['WBJEE', 'JEE Main', 'IEMJEE'],
        totalSeats: 240,
        availableSeats: 180,
        feesStructure: {
          admissionFee: 30000,
          perSemesterTuition: 87500,
          totalSemesters: 8,
          cautionDeposit: 10000,
          libraryAndLabFee: 15000,
          totalCourseFee: 755000,
        },
      },
      {
        courseCode: 'BTECH-IT',
        name: 'B.Tech in Information Technology',
        department: 'Department of Information Technology',
        level: 'UG',
        duration: '4 Years (8 Semesters)',
        eligibilityCriteria: 'Minimum 60% in Class 12 PCM. Valid WBJEE / JEE Main rank.',
        minimumPCMPercentage: 60,
        acceptedExams: ['WBJEE', 'JEE Main', 'IEMJEE'],
        totalSeats: 120,
        availableSeats: 95,
        feesStructure: {
          admissionFee: 30000,
          perSemesterTuition: 85000,
          totalSemesters: 8,
          cautionDeposit: 10000,
          libraryAndLabFee: 15000,
          totalCourseFee: 735000,
        },
      },
      {
        courseCode: 'BTECH-ECE',
        name: 'B.Tech in Electronics & Communication Engineering',
        department: 'Department of Electronics & Communication',
        level: 'UG',
        duration: '4 Years (8 Semesters)',
        eligibilityCriteria: 'Minimum 55% in Class 12 PCM. Valid WBJEE / JEE Main rank.',
        minimumPCMPercentage: 55,
        acceptedExams: ['WBJEE', 'JEE Main', 'IEMJEE'],
        totalSeats: 180,
        availableSeats: 140,
        feesStructure: {
          admissionFee: 30000,
          perSemesterTuition: 82500,
          totalSemesters: 8,
          cautionDeposit: 10000,
          libraryAndLabFee: 15000,
          totalCourseFee: 715000,
        },
      },
      {
        courseCode: 'BCA',
        name: 'Bachelor of Computer Applications (BCA)',
        department: 'Department of Computer Applications',
        level: 'UG',
        duration: '3 Years (6 Semesters)',
        eligibilityCriteria: 'Passed 10+2 with Mathematics / Computer Application with minimum 50% marks.',
        minimumPCMPercentage: 50,
        acceptedExams: ['IEMJEE', 'Direct / Merit'],
        totalSeats: 120,
        availableSeats: 70,
        feesStructure: {
          admissionFee: 20000,
          perSemesterTuition: 45000,
          totalSemesters: 6,
          cautionDeposit: 8000,
          libraryAndLabFee: 10000,
          totalCourseFee: 308000,
        },
      },
      {
        courseCode: 'MCA',
        name: 'Master of Computer Applications (MCA)',
        department: 'Department of Computer Applications',
        level: 'PG',
        duration: '2 Years (4 Semesters)',
        eligibilityCriteria: 'Graduation in BCA / B.Sc (IT/CS) with minimum 50% marks and Mathematics at 10+2 level. Valid WB-JECA rank.',
        minimumPCMPercentage: 50,
        acceptedExams: ['Direct / Merit', 'Other'],
        totalSeats: 60,
        availableSeats: 42,
        feesStructure: {
          admissionFee: 25000,
          perSemesterTuition: 65000,
          totalSemesters: 4,
          cautionDeposit: 10000,
          libraryAndLabFee: 12000,
          totalCourseFee: 307000,
        },
      },
      {
        courseCode: 'BBA',
        name: 'Bachelor of Business Administration (BBA)',
        department: 'School of Management',
        level: 'UG',
        duration: '3 Years (6 Semesters)',
        eligibilityCriteria: 'Passed 10+2 with English from recognized board with 50% aggregate marks.',
        minimumPCMPercentage: 45,
        acceptedExams: ['IEMJEE', 'Direct / Merit'],
        totalSeats: 120,
        availableSeats: 88,
        feesStructure: {
          admissionFee: 20000,
          perSemesterTuition: 50000,
          totalSemesters: 6,
          cautionDeposit: 8000,
          libraryAndLabFee: 8000,
          totalCourseFee: 336000,
        },
      },
      {
        courseCode: 'MBA',
        name: 'Master of Business Administration (MBA)',
        department: 'School of Management',
        level: 'PG',
        duration: '2 Years (4 Semesters)',
        eligibilityCriteria: 'Graduation in any discipline with min 50% marks. Valid CAT/MAT/JEMAT/IEMJEE score.',
        minimumPCMPercentage: 50,
        acceptedExams: ['CAT', 'MAT', 'IEMJEE'],
        totalSeats: 120,
        availableSeats: 65,
        feesStructure: {
          admissionFee: 35000,
          perSemesterTuition: 95000,
          totalSemesters: 4,
          cautionDeposit: 10000,
          libraryAndLabFee: 15000,
          totalCourseFee: 440000,
        },
      },
    ]);

    console.log('[Seeder] Creating Student Profiles...');
    const student1 = await Student.create({
      user: studentUser1._id,
      dob: new Date('2005-04-12'),
      gender: 'Male',
      bloodGroup: 'B+',
      nationality: 'Indian',
      category: 'General',
      guardian: {
        fatherName: 'Swapan Roy',
        fatherOccupation: 'Government Service',
        fatherPhone: '+91 9830099887',
        motherName: 'Anjana Roy',
        motherOccupation: 'Teacher',
        motherPhone: '+91 9830099888',
        annualIncome: 850000,
      },
      address: {
        present: {
          street: 'Block BD, Plot 14, Salt Lake Sector 1',
          city: 'Kolkata',
          district: 'North 24 Parganas',
          state: 'West Bengal',
          pincode: '700064',
          country: 'India',
        },
        permanent: {
          street: 'Block BD, Plot 14, Salt Lake Sector 1',
          city: 'Kolkata',
          district: 'North 24 Parganas',
          state: 'West Bengal',
          pincode: '700064',
          country: 'India',
          sameAsPresent: true,
        },
      },
      academics: {
        class10: {
          board: 'WBBSE',
          schoolName: 'Salt Lake School',
          passingYear: 2021,
          rollNumber: 'WBBSE-102934',
          totalMarks: 700,
          marksObtained: 616,
          percentage: 88,
        },
        class12: {
          board: 'WBCHSE',
          schoolName: 'Salt Lake School',
          passingYear: 2023,
          stream: 'Science',
          rollNumber: 'WBCHSE-492019',
          totalMarks: 500,
          marksObtained: 445,
          percentage: 89,
          pcmPercentage: 91,
        },
        entranceExam: {
          examType: 'WBJEE',
          rollNumber: 'WBJEE-2026-49281',
          rank: 2150,
          score: 84.5,
          examYear: 2026,
        },
      },
      profileCompleted: true,
      completionPercentage: 100,
    });

    const student2 = await Student.create({
      user: studentUser2._id,
      dob: new Date('2005-08-25'),
      gender: 'Female',
      bloodGroup: 'O+',
      nationality: 'Indian',
      category: 'General',
      guardian: {
        fatherName: 'Debjit Sen',
        fatherOccupation: 'Business',
        fatherPhone: '+91 9433112233',
        motherName: 'Madhumita Sen',
        motherOccupation: 'Home Maker',
        annualIncome: 1200000,
      },
      address: {
        present: {
          street: '45/B Southern Avenue',
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          pincode: '700029',
          country: 'India',
        },
        permanent: {
          street: '45/B Southern Avenue',
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          pincode: '700029',
          sameAsPresent: true,
        },
      },
      academics: {
        class10: {
          board: 'CBSE',
          schoolName: 'South Point High School',
          passingYear: 2021,
          percentage: 92,
        },
        class12: {
          board: 'CBSE',
          schoolName: 'South Point High School',
          passingYear: 2023,
          stream: 'Science',
          percentage: 91,
          pcmPercentage: 93,
        },
        entranceExam: {
          examType: 'JEE Main',
          rollNumber: 'JEEM-2026-88192',
          rank: 18450,
          score: 94.2,
          examYear: 2026,
        },
      },
      profileCompleted: true,
      completionPercentage: 100,
    });

    const student3 = await Student.create({
      user: studentUser3._id,
      dob: new Date('2004-11-19'),
      gender: 'Female',
      bloodGroup: 'A+',
      category: 'OBC-A',
      address: {
        present: {
          street: '12 Newtown Action Area 1',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700156',
        },
      },
      academics: {
        class10: { board: 'ICSE', passingYear: 2021, percentage: 86 },
        class12: { board: 'ISC', passingYear: 2023, stream: 'Commerce', percentage: 88 },
        entranceExam: { examType: 'IEMJEE', rank: 320, score: 78 },
      },
      profileCompleted: true,
      completionPercentage: 80,
    });

    console.log('[Seeder] Creating Applications...');
    // Rahul's Application (APPROVED)
    const app1 = await Application.create({
      applicationNumber: 'IEM-2026-881023',
      user: studentUser1._id,
      student: student1._id,
      course: courses[0]._id, // BTECH-CSE
      admissionCycle: '2026-2027',
      status: 'APPROVED',
      currentStep: 6,
      isFeePaid: true,
      submissionDate: new Date('2026-02-10'),
      assignedOfficer: officerEngg._id,
      officerRemarks: 'Academic records verified and PCM marks exceed cutoff. Approved for B.Tech CSE seat allocation.',
      decisionDate: new Date('2026-02-15'),
      admissionOfferLetterGenerated: true,
      meritScore: 91.5,
      timeline: [
        {
          status: 'SUBMITTED',
          actorName: studentUser1.name,
          role: 'student',
          comment: 'Application submitted successfully with mock fee payment.',
          timestamp: new Date('2026-02-10T10:00:00Z'),
        },
        {
          status: 'UNDER_REVIEW',
          actorName: officerEngg.name,
          role: 'officer',
          comment: 'Application taken up for document screening.',
          timestamp: new Date('2026-02-12T11:30:00Z'),
        },
        {
          status: 'APPROVED',
          actorName: officerEngg.name,
          role: 'officer',
          comment: 'All qualifications verified. Admission granted.',
          timestamp: new Date('2026-02-15T14:20:00Z'),
        },
      ],
    });

    // Priya's Application (UNDER_REVIEW)
    const app2 = await Application.create({
      applicationNumber: 'IEM-2026-912044',
      user: studentUser2._id,
      student: student2._id,
      course: courses[1]._id, // BTECH-IT
      admissionCycle: '2026-2027',
      status: 'UNDER_REVIEW',
      currentStep: 6,
      isFeePaid: true,
      submissionDate: new Date('2026-02-18'),
      assignedOfficer: officerEngg._id,
      officerRemarks: 'Class 12 verification ongoing. Roll number confirmed with board portal.',
      meritScore: 92.0,
      timeline: [
        {
          status: 'SUBMITTED',
          actorName: studentUser2.name,
          role: 'student',
          comment: 'Application submitted.',
          timestamp: new Date('2026-02-18T12:00:00Z'),
        },
        {
          status: 'UNDER_REVIEW',
          actorName: officerEngg.name,
          role: 'officer',
          comment: 'Assigned to engineering review desk.',
          timestamp: new Date('2026-02-19T09:00:00Z'),
        },
      ],
    });

    // Sneha's Application (SUBMITTED)
    const app3 = await Application.create({
      applicationNumber: 'IEM-2026-304192',
      user: studentUser3._id,
      student: student3._id,
      course: courses[5]._id, // BBA
      admissionCycle: '2026-2027',
      status: 'SUBMITTED',
      currentStep: 6,
      isFeePaid: true,
      submissionDate: new Date('2026-02-22'),
      assignedOfficer: officerMgmt._id,
      timeline: [
        {
          status: 'SUBMITTED',
          actorName: studentUser3.name,
          role: 'student',
          comment: 'Application submitted for BBA program.',
          timestamp: new Date('2026-02-22T15:45:00Z'),
        },
      ],
    });

    console.log('[Seeder] Creating Notifications...');
    await Notification.create([
      {
        recipient: studentUser1._id,
        title: 'Congratulations! Admission Application Approved',
        message: 'Your application IEM-2026-881023 for B.Tech in CSE has been approved. You may download your Offer Letter and admission slip.',
        type: 'SUCCESS',
        isRead: false,
      },
      {
        recipient: studentUser2._id,
        title: 'Application Under Review',
        message: 'Your application IEM-2026-912044 is currently under verification by the admission committee.',
        type: 'INFO',
        isRead: true,
      },
      {
        targetRole: 'all',
        title: 'IEM Kolkata Admission Notice 2026',
        message: 'Last date for submission of Class 12 improvement marksheets is 15th October 2026.',
        type: 'ANNOUNCEMENT',
        isRead: false,
      },
    ]);

    console.log('[Seeder] Seeding Complete! Credentials summary:');
    console.log('---------------------------------------------------------');
    console.log('Admin:    admin@iem.edu.in          / Admin@123');
    console.log('Officer:  officer.engg@iem.edu.in   / Officer@123');
    console.log('Officer:  officer.mgmt@iem.edu.in   / Officer@123');
    console.log('Student:  student.rahul@gmail.com   / Student@123');
    console.log('Student:  student.priya@gmail.com   / Student@123');
    console.log('Student:  student.sneha@gmail.com   / Student@123');
    console.log('---------------------------------------------------------');

    await mongoose.disconnect();
    console.log('[Seeder] Disconnected from MongoDB cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
