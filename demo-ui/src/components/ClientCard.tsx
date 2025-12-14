import React, { useRef, useEffect } from 'react';
import { Activity, Filter, Clock } from 'lucide-react';

interface Log {
    message: string;
    timestamp: string;
}

interface ClientCardProps {
    title: string;
    subtitle: string;
    type: 'polling' | 'sse' | 'filtered';
    logs: Log[];
}

export const ClientCard: React.FC<ClientCardProps> = ({ title, subtitle, type, logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const Icon = type === 'polling' ? Clock : type === 'sse' ? Activity : Filter;

    console.log('Rendering Card', title, logs.length);

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', backgroundColor: '#21262d', borderRadius: '50%', marginRight: '1rem' }}>
                    <Icon size={24} color="#58a6ff" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
                    <p style={{ margin: 0, color: '#8b949e', fontSize: '0.9rem' }}>{subtitle}</p>
                </div>
            </div>

            <div className="log-container" ref={scrollRef}>
                {logs.length === 0 && <div style={{ color: '#444', textAlign: 'center', marginTop: '4rem' }}>Waiting for logs...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="log-entry">
                        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span style={{ color: log.message.includes('304') ? '#8b949e' : log.message.includes('Updated') ? '#3fb950' : '#e6edf3' }}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
