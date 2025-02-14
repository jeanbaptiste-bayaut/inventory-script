import fs from 'fs';
import xml2js from 'xml2js';
import { Parser } from 'json2csv';
import path from 'path';

export default class ProcessFile {
  static async processFile(req, res) {
    // Créez un nouveau parser
    const parser = new xml2js.Parser({ explicitArray: false });

    // Récupérer le nom du fichier XML
    const __dirname = path.resolve(); // ES6

    const files = fs.readdirSync(path.join(__dirname, '../uploads'));

    const xmlFile = files.find((file) => file.endsWith('.xml'));

    // Lire le fichier XML
    fs.readFile(`uploads/${xmlFile}`, (err, data) => {
      if (err) {
        console.error('Erreur lors de la lecture du fichier XML :', err);
        return;
      }

      // Convertir le XML en objet JavaScript
      parser.parseString(data, (err, result) => {
        if (err) {
          console.error("Erreur lors de l'analyse du XML :", err);
          return;
        }

        // Accéder aux coupons
        const list = result['inventory']['inventory-list']['records']['record'];
        const eanList = [];

        // Gérer le cas où il y a plusieurs ensembles de codes

        list.forEach((record) => {
          eanList.push({
            ean: record['$']['product-id'],
            ats: record.allocation,
          });
        });

        console.log(eanList[0]);

        // //Configuration des champs (colonnes)
        const fields = ['ean', 'ats'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(eanList);

        const date = new Date(Date.now()); // Convertir le timestamp en objet Date
        const day = String(date.getDate()).padStart(2, '0'); // Jour (01-31)
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (01-12)
        const year = date.getFullYear(); // Année (2024)
        const hours = String(date.getHours()).padStart(2, '0'); // Heures (00-23)
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes (00-59)
        const seconds = String(date.getSeconds()).padStart(2, '0'); // Secondes (00-59)

        const formatDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;

        const __dirname = path.resolve(); // ES6
        const outPath = path.join(
          __dirname,
          `../back/export/${formatDate}-inventory-export.csv`
        );

        // Écrire le fichier CSV
        fs.writeFile(outPath, csv, (err) => {
          if (err) {
            console.error("Erreur lors de l'écriture du fichier CSV :", err);
            return;
          }
          console.log('Le fichier CSV a été créé avec succès !');
        });
        res.status(200).json({ message: 'Fichier traité avec succès' });
      });
    });
  }

  static async displayFiles(req, res) {
    fs.readdir('export', (err, files) => {
      const __dirname = path.resolve(); // ES6
      const UPLOADS_DIR = path.join(__dirname, '../export');

      if (err) {
        return res
          .status(500)
          .json({ message: 'Erreur lors de la lecture du dossier' });
      }

      res.json(files); // Retourne la liste des fichiers
    });
  }
}
