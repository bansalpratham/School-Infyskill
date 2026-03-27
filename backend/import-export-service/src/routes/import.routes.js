const express = require('express');
const multer = require('multer');
const importController = require('../controllers/import.controller');

const verifyToken = require('../middlewares/verifyToken');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.use(verifyToken, authorizeRole('admin'));

router.post('/students', upload.single('file'), importController.importStudents);
router.post('/fees', upload.single('file'), importController.importFees);

module.exports = router;
