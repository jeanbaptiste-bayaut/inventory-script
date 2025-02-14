import fs from 'fs';
import path from 'path';

const deleteFiles = (req, res, next) => {
  const __dirname = path.resolve(); // ES6
  const upload_dir = path.join(__dirname, 'uploads');
  console.log('upload_dir', upload_dir);

  // Vérifier si le dossier existe
  if (!fs.existsSync(upload_dir)) {
    console.log("Le dossier 'uploads' n'existe pas.");
    return next();
  }

  // Récupérer le nom du fichier XML
  const files = fs.readdirSync(upload_dir);
  console.log('files', files);

  // Vérifier si le dossier est vide
  if (files.length === 0) {
    return next();
  }

  const filePath = path.join(upload_dir, files[0]);
  // supprimer le fichier précédent
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de la suppression du fichier XML :', err);
      return next();
    }
    console.log('Fichier supprimé avec succès !');
    next();
  });
};

export default deleteFiles;
