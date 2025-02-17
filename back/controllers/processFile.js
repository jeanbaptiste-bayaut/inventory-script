import fs from 'fs';
import sax from 'sax';
import { Parser } from 'json2csv';
import path from 'path';

export default class ProcessFile {
  static async processFile(req, res) {
    try {
      const __dirname = path.resolve();
      const uploadDir = path.join(__dirname, 'uploads');

      // Vérifier si le dossier 'uploads' existe
      if (!fs.existsSync(uploadDir)) {
        return res
          .status(400)
          .json({ error: "Le dossier 'uploads' n'existe pas." });
      }

      // Récupérer les fichiers XML
      const files = fs.readdirSync(uploadDir);
      const xmlFile = files.find((file) => file.endsWith('.xml'));

      // Vérifier s'il y a un fichier XML
      if (!xmlFile) {
        return res
          .status(400)
          .json({ error: "Aucun fichier XML trouvé dans 'uploads'" });
      }

      console.log(`🔍 Fichier XML trouvé: ${xmlFile}`);

      const BATCH_SIZE = 10000; // Nombre d'éléments par batch
      let currentBatch = [];
      let batchCount = 0;
      let eanList = [];
      let currentTag = '';
      let currentRecord = {};
      let currentText = '';

      const parser = sax.createStream(true, {});
      const xmlStream = fs.createReadStream(path.join(uploadDir, xmlFile));

      parser.on('opentag', (node) => {
        currentTag = node.name;
        currentText = '';
        if (node.name === 'record') {
          currentRecord = {
            ean: node.attributes['product-id'],
          };
        }
      });

      parser.on('text', (text) => {
        currentText += text;
      });

      parser.on('closetag', (nodeName) => {
        if (nodeName === 'allocation') {
          currentRecord.ats = currentText.trim();
        }

        if (nodeName === 'record') {
          currentBatch.push(currentRecord);

          if (currentBatch.length >= BATCH_SIZE) {
            eanList.push(...currentBatch);
            currentBatch = [];
            batchCount++;
          }
        }
        currentTag = ''; // Réinitialiser le tag courant lorsqu'un tag est fermé
        currentText = ''; // Réinitialiser le texte courant lorsqu'un tag est fermé
      });

      parser.on('end', () => {
        if (currentBatch.length > 0) {
          eanList.push(...currentBatch);
        }
        processBatch(eanList);

        console.log(
          "📊 Nombre total d'enregistrements traités:",
          batchCount * BATCH_SIZE + eanList.length
        );
        res.status(200).json({
          message: 'Fichier traité avec succès',
        });
      });

      parser.on('error', (err) => {
        console.error("❌ Erreur lors de l'analyse du XML :", err);
        res.status(500).json({ error: "Erreur lors de l'analyse du XML." });
      });

      xmlStream.pipe(parser);

      function processBatch(batch) {
        // Convertir en CSV
        const fields = ['ean', 'ats'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(batch);

        // Générer un nom de fichier avec la date actuelle
        const date = new Date();
        const formatDate = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(
          date.getHours()
        ).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;

        const exportDir = path.join(__dirname, 'export');
        if (!fs.existsSync(exportDir))
          fs.mkdirSync(exportDir, { recursive: true });

        const outPath = path.join(
          exportDir,
          `${formatDate}-inventory-export.csv`
        );

        // Écrire le fichier CSV
        fs.writeFile(outPath, csv, (err) => {
          if (err) {
            console.error("❌ Erreur lors de l'écriture du fichier CSV :", err);
            return res
              .status(500)
              .json({ error: "Erreur lors de l'écriture du fichier CSV." });
          }

          console.log(`✅ Fichier CSV créé avec succès: ${outPath}`);
        });
      }
    } catch (error) {
      console.error('❌ Erreur inattendue :', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  static async displayFiles(req, res) {
    const __dirname = path.resolve(); // ES6
    const UPLOADS_DIR = path.join(__dirname, 'export');

    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Erreur lors de la lecture du dossier' });
      }

      res.json(files); // Retourne la liste des fichiers
    });
  }
}
