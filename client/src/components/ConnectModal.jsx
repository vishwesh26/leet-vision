import React, { useState } from 'react';
import { useSolved } from '../context/SolvedContext';

const ConnectModal = ({ onClose }) => {
    const { syncWithLeetCode, isSyncing, syncError } = useSolved();
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.trim()) {
            await syncWithLeetCode(username);
            // If no error, we could auto close, or show success.
            // But syncWithLeetCode is void promise, we check error state or if context username updated.
            // For simplicity, we just rely on visual feedback in modal.
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: '#1a1a1a', padding: '2rem', borderRadius: '12px',
                width: '90%', maxWidth: '400px', border: '1px solid #333'
            }}>
                <h2 style={{ marginTop: 0 }}>Connect LeetCode</h2>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Enter your username to sync recently solved problems.
                    <br />
                    <small>Note: Profile must be public.</small>
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="LeetCode Username (e.g. neal_wu)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            padding: '0.8rem', borderRadius: '6px', border: '1px solid #444',
                            background: '#222', color: 'white', outline: 'none'
                        }}
                    />

                    {syncError && <div style={{ color: '#ff4444', fontSize: '0.85rem' }}>{syncError}</div>}

                    <button
                        type="submit"
                        disabled={isSyncing}
                        style={{
                            padding: '0.8rem', borderRadius: '6px', border: 'none',
                            background: 'var(--accent-orange)', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                            opacity: isSyncing ? 0.7 : 1
                        }}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Profile'}
                    </button>
                </form>

                <button onClick={onClose} style={{
                    marginTop: '1rem', background: 'transparent', border: 'none',
                    color: '#666', cursor: 'pointer', width: '100%'
                }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConnectModal;
