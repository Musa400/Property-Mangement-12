import React, { useState } from 'react';
import Papa from 'papaparse';
import XLSX from 'xlsx';

function BulkUpload({ onBulkUpload }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;

      if (file.type.includes('csv')) {
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            onBulkUpload(result.data);
          },
        });
      } else if (file.type.includes('excel')) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        onBulkUpload(jsonData);
      }
    };

    if (file.type.includes('csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="bulk-upload">
      <h2>Bulk Upload</h2>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default BulkUpload;