import { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [xml, setXml] = useState(null);
  const [files, setFiles] = useState([]);

  const handleXml = async () => {
    const formData = new FormData();
    formData.append('xmlfile', xml);

    try {
      const result = await axios.post('http://localhost:3000/upload', formData);
      console.log('Fichier envoyé', result);

      if (result.status === 200) {
        const response = await axios.get('http://localhost:3000/files');
        console.log('response', response.data);

        setFiles(response.data);
      }
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  return (
    <>
      <h1>LE JOLI SCRIPT POUR MARGAUX</h1>
      <input
        type="file"
        name="xmlfile"
        accept=".xml"
        onChange={(e) => setXml(e.target.files[0])}
      />
      <button onClick={handleXml}>Process</button>
      <p>Fichiers d'export</p>
      <ul>
        {files.map((file) => (
          <li key={file}>
            <a href={`http://localhost:3000/export/${file}`} download>
              {file}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
