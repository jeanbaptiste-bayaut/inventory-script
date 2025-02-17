import { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [xml, setXml] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleXml = async () => {
    const formData = new FormData();
    formData.append('xmlfile', xml);

    try {
      setIsLoading(true);
      const result = await axios.post(
        'https://inventory-script.onrender.com/upload',
        formData
      );
      console.log('Fichier envoyé', result);

      if (result.status === 200) {
        const response = await axios.get(
          'https://inventory-script.onrender.com/files'
        );
        console.log('response', response.data);

        setFiles(response.data);
        setIsLoading(false);
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
      <p>Fichiers d&apos;export</p>
      {isLoading && (
        <div className="loading-data">
          <p>Loading data ...</p>
          <span className="loader"></span>
        </div>
      )}
      <ul>
        {files.map((file) => (
          <li key={file}>
            <a
              href={`https://inventory-script.onrender.com/export/${file}`}
              download
            >
              {file}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
