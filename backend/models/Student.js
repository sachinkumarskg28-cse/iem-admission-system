const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
      index: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    nationality: {
      type: String,
      default: 'Indian',
    },
    category: {
      type: String,
      enum: ['General', 'OBC-A', 'OBC-B', 'SC', 'ST', 'EWS', 'TFW'],
      default: 'General',
    },
    isPhysicallyChallenged: {
      type: Boolean,
      default: false,
    },
    guardian: {
      fatherName: { type: String, trim: true },
      fatherOccupation: { type: String, trim: true },
      fatherPhone: { type: String, trim: true },
      motherName: { type: String, trim: true },
      motherOccupation: { type: String, trim: true },
      motherPhone: { type: String, trim: true },
      annualIncome: { type: Number, default: 0 },
    },
    address: {
      present: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, default: 'India' },
      },
      permanent: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, default: 'India' },
        sameAsPresent: { type: Boolean, default: true },
      },
    },
    academics: {
      class10: {
        board: { type: String, trim: true },
        schoolName: { type: String, trim: true },
        passingYear: { type: Number },
        rollNumber: { type: String, trim: true },
        totalMarks: { type: Number },
        marksObtained: { type: Number },
        percentage: { type: Number },
      },
      class12: {
        board: { type: String, trim: true },
        schoolName: { type: String, trim: true },
        passingYear: { type: Number },
        stream: { type: String, trim: true }, // Science, Commerce, Arts
        rollNumber: { type: String, trim: true },
        totalMarks: { type: Number },
        marksObtained: { type: Number },
        percentage: { type: Number },
        pcmPercentage: { type: Number }, // Physics, Chem, Math aggregate
      },
      graduation: {
        university: { type: String, trim: true },
        college: { type: String, trim: true },
        degree: { type: String, trim: true },
        passingYear: { type: Number },
        cgpa: { type: Number },
      },
      entranceExam: {
        examType: {
          type: String,
          enum: ['WBJEE', 'JEE Main', 'IEMJEE', 'GATE', 'CAT', 'MAT', 'Direct / Merit', 'Other'],
          default: 'IEMJEE',
        },
        rollNumber: { type: String, trim: true },
        rank: { type: Number },
        score: { type: Number },
        examYear: { type: Number, default: 2026 },
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate studentId if missing
studentSchema.pre('save', function (next) {
  if (!this.studentId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.studentId = `IEM-STD-${new Date().getFullYear()}-${randomDigits}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
