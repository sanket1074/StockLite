import React from 'react';
import { Database, AlertCircle, Terminal, HelpCircle } from 'lucide-react';

const DatabaseAlert = ({ dbStatus, onRetry }) => {
  if (dbStatus === 'Connected' || dbStatus === null) {
    return null;
  }

  return (
    <div className="db-alert-banner">
      <div className="db-alert-icon">
        <AlertCircle size={24} />
      </div>
      <div className="db-alert-content" style={{ flex: 1 }}>
        <h4>MongoDB Connection Required (Status: {dbStatus})</h4>
        <p>
          The backend is running, but it cannot reach a MongoDB instance. To store and manage your products, please start your local MongoDB service or configure a MongoDB Atlas connection.
        </p>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>
            <strong>Option 1 (Local MongoDB):</strong> In an Administrator PowerShell terminal, run:
            <div className="db-alert-code">net start MongoDB</div>
            &nbsp;or&nbsp;
            <div className="db-alert-code">"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe"</div>
          </div>
          <div>
            <strong>Option 2 (MongoDB Atlas Cloud):</strong> Paste your connection string into <code>server/.env</code>:
            <div className="db-alert-code">MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/stocklite</div>
          </div>
        </div>
      </div>
      <div>
        <button className="btn-secondary" onClick={onRetry} style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default DatabaseAlert;
