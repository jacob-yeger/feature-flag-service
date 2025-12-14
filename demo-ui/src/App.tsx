import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClientCard } from './components/ClientCard';
import { ToggleLeft } from 'lucide-react';

interface LogEntry {
  source: string;
  message: string;
  timestamp: string;
}

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [key, setKey] = useState('new-feature');

  useEffect(() => {
    // In Docker, we map ports to localhost.
    const eventSource = new EventSource('http://localhost:3001/monitor/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // data is { source, message, timestamp }
        setLogs((prev) => [...prev.slice(-49), data]); // Keep last 50
      } catch (e) {
        console.error('Parse error', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const toggleFlag = async () => {
    try {
      // First get current state to toggle
      const res = await axios.get(`http://localhost:3000/feature-flags/${key}`);
      const flag = res.data;
      await axios.patch(`http://localhost:3000/feature-flags/${key}`, {
        isEnabled: !flag.isEnabled
      });
    } catch (e) {
      // If 404, create it
      await axios.post('http://localhost:3000/feature-flags', {
        key,
        isEnabled: true,
        description: 'Demo flag'
      });
    }
  };

  const getLogs = (source: string) => logs.filter(l => l.source === source);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Feature Flag Service</h1>
          <p style={{ fontSize: '1.2rem', color: '#8b949e' }}>Real-time Scaling Demo</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            value={key}
            onChange={e => setKey(e.target.value)}
            style={{ padding: '0.6em', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: 'white' }}
          />
          <button className="btn" onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToggleLeft size={20} />
            Toggle / Create Flag
          </button>
        </div>
      </header>

      <div className="grid">
        <ClientCard
          title="Polling Client"
          subtitle="Uses ETags (304 Not Modified)"
          type="polling"
          logs={getLogs('PollingClient')}
        />
        <ClientCard
          title="SSE Client"
          subtitle="Real-time Server-Sent Events"
          type="sse"
          logs={getLogs('SSEClient')}
        />
        <ClientCard
          title="Filtered Client"
          subtitle="Only receives 'beta' prefix"
          type="filtered"
          logs={getLogs('FilteredClient')}
        />
      </div>
    </div>
  );
}

export default App;
