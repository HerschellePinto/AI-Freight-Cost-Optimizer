import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [csvFile, setCsvFile] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    weight: '',
    priority: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [token, setToken] = useState('');

  const handleCSVUpload = async () => {
    if (!csvFile) return alert('Please select a CSV file');
    const form = new FormData();
    form.append('file', csvFile);

    try {
      const res = await axios.post('http://localhost:8000/upload-csv', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message);
    } catch (err) {
      alert('Upload failed: ' + err.response?.data?.detail);
    }
  };

  const handlePredict = async () => {
    try {
      const res = await axios.post('http://localhost:8000/predict', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrediction(res.data.estimated_cost);

      // Create downloadable CSV
      const csv = `Source,Destination,Weight,Priority,Estimated Cost\n${formData.source},${formData.destination},${formData.weight},${formData.priority},${res.data.estimated_cost}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert('Prediction failed: ' + err.response?.data?.detail);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">🚛 Freight Cost Optimizer</h1>

        <div>
          <label className="block font-medium mb-2">Bearer Token</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Upload CSV to Train Model</label>
          <input type="file" onChange={(e) => setCsvFile(e.target.files[0])} />
          <button
            onClick={handleCSVUpload}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload CSV
          </button>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Source</label>
          <input className="w-full border px-3 py-2 rounded" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />

          <label className="block font-medium">Destination</label>
          <input className="w-full border px-3 py-2 rounded" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />

          <label className="block font-medium">Weight (kg)</label>
          <input className="w-full border px-3 py-2 rounded" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />

          <label className="block font-medium">Priority (1-5)</label>
          <input className="w-full border px-3 py-2 rounded" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />

          <button
            onClick={handlePredict}
            className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Predict Cost
          </button>
        </div>

        {prediction && (
          <div className="text-center mt-4">
            <h2 className="text-lg font-semibold">Estimated Cost: ₹{prediction}</h2>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="prediction.csv"
                className="block mt-2 text-blue-600 hover:underline"
              >
                Download CSV
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
