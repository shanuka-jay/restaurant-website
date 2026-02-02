const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/upload/menu-image
// @desc    Upload menu item image
// @access  Private/Admin
router.post('/menu-image', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Generate URL for the uploaded image
        const imageUrl = `/uploads/menu-items/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                url: imageUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image'
        });
    }
});

// @route   DELETE /api/upload/menu-image/:filename
// @desc    Delete menu item image
// @access  Private/Admin
router.delete('/menu-image/:filename', protect, admin, (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, '../uploads/menu-items', filename);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete the file
        fs.unlinkSync(filepath);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image'
        });
    }
});

// @route   POST /api/upload/multiple-images
// @desc    Upload multiple images
// @access  Private/Admin
router.post('/multiple-images', protect, admin, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            url: `/uploads/menu-items/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            message: `${uploadedFiles.length} images uploaded successfully`,
            data: uploadedFiles
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images'
        });
    }
});

module.exports = router;
