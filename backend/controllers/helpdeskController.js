const dataService = require('../services/dataService');
const { recordAudit } = require('../middleware/auditMiddleware');

// Official IEM Admission FAQs
const IEM_FAQS = [
  {
    category: 'Eligibility & Criteria',
    question: 'What is the eligibility criteria for B.Tech admission at IEM Kolkata?',
    answer: 'Candidates must have passed 10+2 Examination from a recognized Board with a minimum of 60% aggregate marks in Physics, Chemistry, and Mathematics (PCM). Candidates must also hold a valid rank in WBJEE or JEE (Main).',
  },
  {
    category: 'Entrance Exams',
    question: 'Which entrance exams are accepted for IEM admissions?',
    answer: 'For B.Tech: WBJEE & JEE Main. For MBA: CAT, MAT, JEMAT, or IEMJEE. For MCA: JECA / IEMJEE. For BCA & BBA: Valid CET / IEMJEE / Class 12 merit score.',
  },
  {
    category: 'Fee & Payment',
    question: 'What is the application processing fee and how can I pay?',
    answer: 'The application registration and processing fee is ₹2,000 (Non-refundable). You can pay seamlessly online using Razorpay, UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, or Net Banking.',
  },
  {
    category: 'Document Scrutiny',
    question: 'What documents are required to be uploaded during the application wizard?',
    answer: '1) Recent Passport Size Photograph; 2) Candidate Signature; 3) Class 10 Board Marksheet / Admit Card; 4) Class 12 Board Marksheet; 5) Valid Entrance Exam Rank Card (WBJEE/JEE); 6) Aadhaar Card; 7) Category Certificate (SC/ST/OBC) if applicable.',
  },
  {
    category: 'Hostel & Facilities',
    question: 'Does IEM provide campus hostel facilities for outstation students?',
    answer: 'Yes, IEM Kolkata provides separate, secure, Wi-Fi enabled hostel facilities for both boys and girls within close proximity to the Salt Lake Sector V campus, complete with hygienic cafeteria and round-the-clock security.',
  },
  {
    category: 'Placements',
    question: 'What is the placement record of IEM Kolkata?',
    answer: 'IEM maintains a 100%+ placement track record. Renowned recruiters including TCS, Cognizant, Infosys, Wipro, Amazon, PwC, Oracle, and Capgemini visit annually. The highest domestic/international package stands at ₹72 LPA with a strong average of ₹6.5 LPA.',
  },
];

// @desc    Submit public contact inquiry
// @route   POST /api/helpdesk/contact
// @access  Public
exports.submitContactInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, courseInterested, subject, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const inq = await dataService.createContactInquiry({
      name,
      email,
      phone,
      courseInterested: courseInterested || 'General',
      subject: subject || 'Admission Query',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received by IEM Admissions Helpdesk. Our counselors will contact you shortly.',
      data: inq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get IEM FAQs
// @route   GET /api/helpdesk/faqs
// @access  Public
exports.getFaqs = async (req, res) => {
  res.status(200).json({
    success: true,
    faqs: IEM_FAQS,
  });
};

// @desc    Create support ticket
// @route   POST /api/helpdesk/tickets
// @access  Private (Student)
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, description, applicationNumber, priority } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    const ticket = await dataService.createTicket({
      user: req.user._id || req.user.id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      applicationNumber: applicationNumber || '',
      category: category || 'GENERAL_QUERY',
      subject,
      description,
      priority: priority || 'MEDIUM',
    });

    await recordAudit(req, {
      action: 'TICKET_CREATED',
      module: 'HELPDESK',
      details: { ticketNumber: ticket.ticketNumber, subject: ticket.subject },
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get support tickets
// @route   GET /api/helpdesk/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    const role = req.user.role;
    let filter = {};
    if (role === 'student') {
      filter.user = req.user._id || req.user.id;
    }
    const tickets = await dataService.getTickets(filter);
    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to / update ticket
// @route   PUT /api/helpdesk/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    const { message, status } = req.body;
    const ticket = await dataService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const updatePayload = {};
    if (status) updatePayload.status = status;

    if (message) {
      const responses = ticket.responses || [];
      responses.push({
        responderName: req.user.name,
        responderRole: req.user.role,
        message,
        createdAt: new Date(),
      });
      updatePayload.responses = responses;
    }

    const updated = await dataService.updateTicket(req.params.id, updatePayload);

    await recordAudit(req, {
      action: 'TICKET_UPDATED',
      module: 'HELPDESK',
      details: { ticketId: req.params.id, status },
    });

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      ticket: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact inquiries
// @route   GET /api/helpdesk/inquiries
// @access  Private (Admin / Officer)
exports.getInquiries = async (req, res, next) => {
  try {
    const inquiries = await dataService.getContactInquiries();
    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    next(error);
  }
};
