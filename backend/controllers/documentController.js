const path = require('path');
const dataService = require('../services/dataService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Student)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { documentType, title, applicationId } = req.body;
    const userId = req.user._id || req.user.id;

    const relativePath = `/uploads/${path.relative(path.join(__dirname, '../uploads'), req.file.path).replace(/\\/g, '/')}`;

    const document = await dataService.createDocument({
      user: userId,
      application: applicationId || null,
      documentType,
      title: title || documentType.replace(/_/g, ' '),
      originalFileName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileUrl: relativePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    await recordAudit(req, {
      action: 'DOCUMENT_UPLOADED',
      module: 'DOCUMENT',
      details: { docId: document._id, docType: documentType, originalName: req.file.originalname },
    });

    res.status(201).json({
      success: true,
      message: `${document.title} uploaded successfully.`,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student documents
// @route   GET /api/documents/my
// @access  Private (Student)
exports.getMyDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const documents = await dataService.getDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Student)
exports.deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const deleted = await dataService.deleteDocument(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Document removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
