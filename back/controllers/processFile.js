import fs from 'fs';
import xml2js from 'xml2js';
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

      const parser = new xml2js.Parser({ explicitArray: false });
      const xmlStream = fs.createReadStream(path.join(uploadDir, xmlFile));

      let xmlData = '';

      xmlStream.on('data', (chunk) => {
        xmlData += chunk.toString(); // Lire le fichier par morceaux
      });

      xmlStream.on('end', () => {
        parser.parseString(xmlData, (err, result) => {
          if (err) {
            console.error("❌ Erreur lors de l'analyse du XML :", err);
            return res
              .status(500)
              .json({ error: "Erreur lors de l'analyse du XML." });
          }

          // Extraire les données
          const list = result?.inventory?.['inventory-list']?.records?.record;
          if (!list) {
            return res
              .status(400)
              .json({ error: 'Format XML incorrect ou vide.' });
          }

          const eanList = list.map((record) => ({
            ean: record?.['$']?.['product-id'],
            ats: record?.allocation,
          }));

          console.log("📊 Nombre d'enregistrements:", eanList.length);

          // Convertir en CSV
          const fields = ['ean', 'ats'];
          const json2csvParser = new Parser({ fields });
          const csv = json2csvParser.parse(eanList);

          // Générer un nom de fichier avec la date actuelle
          const date = new Date();
          const formatDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}-${String(date.getDate()).padStart(
            2,
            '0'
          )}_${String(date.getHours()).padStart(2, '0')}-${String(
            date.getMinutes()
          ).padStart(2, '0')}`;

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
              console.error(
                "❌ Erreur lors de l'écriture du fichier CSV :",
                err
              );
              return res
                .status(500)
                .json({ error: "Erreur lors de l'écriture du fichier CSV." });
            }

            console.log(`✅ Fichier CSV créé avec succès: ${outPath}`);
            res.status(200).json({
              message: 'Fichier traité avec succès',
              filePath: outPath,
            });
          });
        });
      });

      xmlStream.on('error', (err) => {
        console.error('❌ Erreur de lecture du fichier XML :', err);
        res.status(500).json({ error: 'Erreur de lecture du fichier XML.' });
      });
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
