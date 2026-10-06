const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generate Application Form PDF
 * @param {Object} applicationData - Populated application data
 * @param {WritableStream} res - HTTP response stream
 */
const generateApplicationPDF = (applicationData, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream output directly to response
  doc.pipe(res);

  const {
    applicationNumber,
    student,
    user,
    course,
    status,
    isFeePaid,
    payment,
    submissionDate,
    timeline,
  } = applicationData;

  // Header Background Banner
  doc.rect(40, 40, 515, 75).fill('#0b3b60');

  // Embed official IEM Logo
  const logoPath = path.join(__dirname, '../public/assets/iem-logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 46, 46, { width: 56 });
    } catch (err) {
      console.warn('PDF logo embed fallback:', err.message);
    }
  }

  // Title inside Banner
  doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold')
    .text('INSTITUTE OF ENGINEERING & MANAGEMENT (IEM)', 105, 47, { align: 'center', width: 440 });
  doc.fontSize(8).font('Helvetica').fillColor('#e2e8f0')
    .text('Sector V, Salt Lake, Kolkata - 700091, WB, India | NAAC "A" Grade | NBA Accredited', 105, 63, { align: 'center', width: 440 });
  doc.fontSize(7.5).font('Helvetica-Oblique').fillColor('#fde047')
    .text('"Good Education, Good Jobs"  •  Affiliated to MAKAUT  •  Approved by AICTE', 105, 76, { align: 'center', width: 440 });
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
    .text('OFFICIAL ADMISSION APPLICATION FORM & REGISTRATION RECORD', 105, 90, { align: 'center', width: 440 });

  let y = 126;

  // Application Meta Box
  doc.rect(40, y, 515, 30).fillAndStroke('#f0f4f8', '#0b3b60');
  doc.fillColor('#0b3b60').fontSize(10).font('Helvetica-Bold');
  doc.text(`Application No: ${applicationNumber || 'N/A'}`, 50, y + 9);
  doc.text(`Status: ${status}`, 240, y + 9);
  doc.text(
    `Date: ${submissionDate ? new Date(submissionDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}`,
    420,
    y + 9
  );

  y += 45;

  // Section 1: Applied Program
  doc.fillColor('#ffffff').rect(40, y, 515, 18).fill('#1a5276');
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold').text('1. PROGRAM APPLIED FOR', 45, y + 4);
  y += 24;

  doc.rect(40, y, 515, 42).stroke('#cccccc');
  doc.fillColor('#222222').fontSize(9).font('Helvetica-Bold').text('Course Name:', 50, y + 6);
  doc.font('Helvetica').text(course?.name || 'N/A', 140, y + 6);

  doc.font('Helvetica-Bold').text('Department:', 50, y + 22);
  doc.font('Helvetica').text(course?.department || 'N/A', 140, y + 22);

  doc.font('Helvetica-Bold').text('Course Code:', 380, y + 6);
  doc.font('Helvetica').text(course?.courseCode || 'N/A', 460, y + 6);

  doc.font('Helvetica-Bold').text('Duration:', 380, y + 22);
  doc.font('Helvetica').text(course?.duration || '4 Years', 460, y + 22);

  y += 52;

  // Section 2: Candidate Personal Information
  doc.fillColor('#ffffff').rect(40, y, 515, 18).fill('#1a5276');
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold').text('2. CANDIDATE PERSONAL INFORMATION', 45, y + 4);
  y += 24;

  doc.rect(40, y, 515, 75).stroke('#cccccc');
  doc.fillColor('#222222').fontSize(8.5);

  doc.font('Helvetica-Bold').text('Full Name:', 50, y + 6);
  doc.font('Helvetica').text(user?.name || 'N/A', 130, y + 6);

  doc.font('Helvetica-Bold').text('Email:', 330, y + 6);
  doc.font('Helvetica').text(user?.email || 'N/A', 380, y + 6);

  doc.font('Helvetica-Bold').text('Mobile No:', 50, y + 22);
  doc.font('Helvetica').text(user?.phone || 'N/A', 130, y + 22);

  doc.font('Helvetica-Bold').text('Date of Birth:', 330, y + 22);
  doc.font('Helvetica').text(
    student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A',
    410,
    y + 22
  );

  doc.font('Helvetica-Bold').text('Gender:', 50, y + 38);
  doc.font('Helvetica').text(student?.gender || 'N/A', 130, y + 38);

  doc.font('Helvetica-Bold').text('Category:', 200, y + 38);
  doc.font('Helvetica').text(student?.category || 'General', 255, y + 38);

  doc.font('Helvetica-Bold').text('Blood Group:', 330, y + 38);
  doc.font('Helvetica').text(student?.bloodGroup || 'N/A', 410, y + 38);

  doc.font('Helvetica-Bold').text('Father\'s Name:', 50, y + 54);
  doc.font('Helvetica').text(student?.guardian?.fatherName || 'N/A', 130, y + 54);

  doc.font('Helvetica-Bold').text('Mother\'s Name:', 330, y + 54);
  doc.font('Helvetica').text(student?.guardian?.motherName || 'N/A', 410, y + 54);

  y += 85;

  // Section 3: Academic Qualifications
  doc.fillColor('#ffffff').rect(40, y, 515, 18).fill('#1a5276');
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold').text('3. ACADEMIC QUALIFICATIONS & ENTRANCE EXAMINATION', 45, y + 4);
  y += 24;

  doc.rect(40, y, 515, 78).stroke('#cccccc');
  doc.fillColor('#222222').fontSize(8.5);

  const c10 = student?.academics?.class10 || {};
  const c12 = student?.academics?.class12 || {};
  const ent = student?.academics?.entranceExam || {};

  doc.font('Helvetica-Bold').text('Class X (Secondary):', 50, y + 6);
  doc.font('Helvetica').text(`Board: ${c10.board || 'CBSE/ICSE'} | Year: ${c10.passingYear || 2022} | Marks: ${c10.percentage || 'N/A'}%`, 180, y + 6);

  doc.font('Helvetica-Bold').text('Class XII (Higher Sec):', 50, y + 24);
  doc.font('Helvetica').text(`Board: ${c12.board || 'CBSE/ISC/State'} | Stream: ${c12.stream || 'Science'} | Overall: ${c12.percentage || 'N/A'}% | PCM: ${c12.pcmPercentage || 'N/A'}%`, 180, y + 24);

  doc.font('Helvetica-Bold').text('Entrance Examination:', 50, y + 42);
  doc.font('Helvetica').text(`Exam: ${ent.examType || 'WBJEE/JEE/IEMJEE'} | Roll: ${ent.rollNumber || 'N/A'} | Rank: ${ent.rank || 'N/A'} | Score: ${ent.score || 'N/A'}`, 180, y + 42);

  doc.font('Helvetica-Bold').text('Address:', 50, y + 60);
  const addr = student?.address?.present || {};
  doc.font('Helvetica').text(`${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 180, y + 60);

  y += 88;

  // Section 4: Application Fee & Payment Details
  doc.fillColor('#ffffff').rect(40, y, 515, 18).fill('#1a5276');
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold').text('4. APPLICATION FEE & PAYMENT STATUS', 45, y + 4);
  y += 24;

  doc.rect(40, y, 515, 42).stroke('#cccccc');
  doc.fillColor('#222222').fontSize(8.5);

  doc.font('Helvetica-Bold').text('Payment Status:', 50, y + 6);
  doc.fillColor(isFeePaid ? '#007700' : '#bb0000').font('Helvetica-Bold').text(isFeePaid ? 'PAID & VERIFIED' : 'PENDING', 140, y + 6);

  doc.fillColor('#222222').font('Helvetica-Bold').text('Fee Amount:', 320, y + 6);
  doc.font('Helvetica').text(`INR ${payment?.amount || 2000}.00`, 400, y + 6);

  doc.font('Helvetica-Bold').text('Transaction ID:', 50, y + 22);
  doc.font('Helvetica').text(payment?.transactionId || (isFeePaid ? 'TXN_IEM_' + Date.now() : 'N/A'), 140, y + 22);

  doc.font('Helvetica-Bold').text('Receipt Number:', 320, y + 22);
  doc.font('Helvetica').text(payment?.receiptNumber || (isFeePaid ? 'RCP_IEM_CONFIRMED' : 'N/A'), 400, y + 22);

  y += 55;

  // Section 5: Candidate Declaration
  doc.rect(40, y, 515, 80).fillAndStroke('#fafafa', '#dddddd');
  doc.fillColor('#444444').fontSize(7.5).font('Helvetica-Bold').text('UNDERTAKING & DECLARATION:', 50, y + 6);
  doc.font('Helvetica').text(
    'I hereby declare that all the information furnished in this admission application form is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my admission shall be liable to be cancelled without any notice. I agree to abide by the rules and regulations of IEM Kolkata.',
    50,
    y + 18,
    { width: 495, align: 'justify' }
  );

  // Signatures
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#222222');
  doc.text('_____________________________________', 50, y + 62);
  doc.text('Signature of Candidate / Guardian', 65, y + 70);

  doc.text('_____________________________________', 360, y + 62);
  doc.text('Authorized Admission Officer Seal & Sign', 360, y + 70);

  // Footer
  doc.fontSize(7.5).fillColor('#777777')
    .text('Institute of Engineering & Management (IEM), Kolkata - Confidential Admission Document. Generated digitally.', 50, 770, { align: 'center' });

  doc.end();
};

module.exports = { generateApplicationPDF };
