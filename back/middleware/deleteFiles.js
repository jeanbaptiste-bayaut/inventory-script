import fs from 'fs';

const deleteFiles = (req, res, next) => {
  const __dirname = path.resolve(); // ES6
  const upload_dir = path.join(__dirname, 'uploads');
  // Récupérer le nom du fichier XML
  const files = fs.readdirSync(upload_dir);

  if (files.length === 0) {
    next();
  }
  // supprimer le fichier précédent
  fs.unlink(`${upload_dir}/${files[0]}`, (err) => {
    if (err) {
      console.error('Erreur lors de la suppression du fichier XML :', err);
      return;
    }
    console.log('Fichier supprimé avec succès !');
  });

  next();
};

export default deleteFiles;
