const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

const mongoURI = 'mongodb+srv://uploader2:uploader2@uploader2.uhnmx1u.mongodb.net/?retryWrites=true&w=majority&appName=uploader2';

const upload = multer({ dest: 'uploads/' });

async function connectDB() {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

app.post('/upload/session', upload.single('file'), async (req, res) => {
    const { id } = req.query;

    if (!id || !req.file) {
        return res.status(400).json({ message: 'ID and file are required' });
    }

    const client = await connectDB();
    const db = client.db('testdb');
    const collection = db.collection('credentials');
    
    const fileContent = fs.readFileSync(req.file.path);
    const result = await collection.insertOne({
        _id: id,
        file: fileContent
    });

    fs.unlinkSync(req.file.path);
    
    client.close();

    res.status(200).json({ fileId: result.insertedId });
});


app.get('/restore/session', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: 'ID parameter is required' });
    }

    const client = await connectDB();
    const db = client.db('testdb');
    const collection = db.collection('credentials');

    const file = await collection.findOne({ _id: id });

    if (!file) {
        client.close();
        return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.zip"`);
    res.send(file.file);

    client.close();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
