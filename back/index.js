import { createServer } from 'http';
import express from 'express';
import path from 'path';
import ProcessFile from './controllers/processFile.js';
import upload from './middleware/multerConfig.js';
import deleteFiles from './middleware/deleteFiles.js';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);

// créer les dossiers uploads et export
const __dirname = path.resolve(); // ES6
const upload_dir = path.join(__dirname, 'uploads');
const export_dir = path.join(__dirname, 'export');

if (!fs.existsSync(upload_dir)) {
  fs.mkdirSync(upload_dir);
}

if (!fs.existsSync(export_dir)) {
  fs.mkdirSync(export_dir);
}

// Servir les fichiers statiques

app.use('/uploads', express.static('./uploads'));
app.use('/export', express.static('./export'));

// Servir les fichiers statiques du front-end
app.use(express.static(path.join(__dirname, '../front/dist')));

app.get('/files', ProcessFile.displayFiles.bind(ProcessFile));

app.post(
  '/upload',
  deleteFiles,
  upload.single('xmlfile'),
  ProcessFile.processFile.bind(ProcessFile)
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/dist', 'index.html'));
});

const PORT = 3000;

httpServer.listen(PORT || 3000, () => {
  console.log(`Server launched at http://localhost:${PORT}`);
});
