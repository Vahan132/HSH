const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');

// Middleware to parse form data
app.use(cors({
    origin: 'https://hshfurnitures.com',  // Allow requests from your production domain only
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // To parse JSON (if necessary)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req.body.categories, 'req.body.categories')
        const categories = req.body.categories || '[]';
        console.log('Categories from the form:', categories); // Debugging line

        if (categories.length === 0) {
            return cb(new Error('No categories selected'), null); // Error if no categories selected
        }

        const selectedCategory = categories;  // For simplicity, taking the first selected category
        const dirPath = path.join(__dirname, 'uploads', selectedCategory);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename based on timestamp
    }
});

const upload = multer({ storage: storage });

// Handle file upload
app.post('admin/upload', upload.array('images', 10), (req, res) => {
    // Log the received categories for debugging
    console.log('Categories received:', req.body.categories);

    // If the categories are coming in as a string (e.g., "kitchen,bathroom"), parse it correctly
    let categories = req.body.categories;

    // If categories are not already an array, handle that case
    if (typeof categories === 'string') {
        // categories = categories.split(',');  // Convert CSV string to an array
    } else if (!Array.isArray(categories)) {
        return res.status(400).send('Invalid categories data');
    }

    // Make sure categories are selected
    if (categories.length === 0) {
        return res.status(400).send('No categories selected');
    }

    // Proceed with the file upload logic
    res.json({ message: 'Files uploaded successfully!' });
});

app.delete('admin/delete/:category/:filename', (req, res) => {
    const category = req.params.category;
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', category, filename);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).send('Error deleting file');
            }
            res.json({ message: 'File deleted successfully' });
        });
    });
});

app.get('admin/get-images', (req, res) => {
    const imageDir = path.join(__dirname, 'uploads');
    fs.readdir(imageDir, (err, categories) => {
        if (err) {
            return res.status(500).send('Error reading uploads directory');
        }

        const images = [];
        categories.forEach((category) => {
            const categoryDir = path.join(imageDir, category);
            if (fs.existsSync(categoryDir)) {
                const files = fs.readdirSync(categoryDir);
                files.forEach((file) => {
                    images.push({ category: category, filename: file });
                });
            }
        });

        res.json({ images: images });
    });
});

app.get('/admin/get-images-by', (req, res) => {
    const imageDir = path.join(__dirname, 'uploads');
    fs.readdir(imageDir, (err, categories) => {
        if (err) {
            return res.status(500).send('Error reading uploads directory');
        }

        const imagesBy = {}
        categories.forEach((category) => {
            const categoryDir = path.join(imageDir, category);
            if (fs.existsSync(categoryDir)) {
                imagesBy[category] = {
                    images: [],
                }
                const files = fs.readdirSync(categoryDir);
                files.forEach((file) => {
                    imagesBy[category].images.push({ category: category, filename: file });
                });
            }
        });

        res.json({ imagesBy: imagesBy });
    });
});


// Serve the index.html page on GET request
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Update the path if it's in a different directory
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
