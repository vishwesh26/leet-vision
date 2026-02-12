import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminSolutionEditor = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [solution, setSolution] = useState({
        questionId: id || '',
        title: '',
        difficulty: 'Medium',
        platform: 'leetcode',
        topics: [],
        problemStatement: '',
        analyticalOverview: '',
        examples: [],
        complexityTable: [],
        approaches: [
            {
                name: 'Optimal Solution',
                concept: '',
                steps: [],
                complexity: { time: '', space: '' },
                codes: { python: '', javascript: '', cpp: '', java: '' }
            }
        ]
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchExisting = async () => {
            if (!id) return;
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';

                // 1. Try to fetch existing solution first
                try {
                    const res = await axios.get(`${API_BASE}/api/solution/${id}`);
                    if (res.data && res.data.approaches) {
                        const data = res.data;
                        setSolution({
                            questionId: data.questionId || id,
                            title: data.title || '',
                            difficulty: data.difficulty || 'Medium',
                            topics: data.topics || [],
                            problemStatement: data.problemStatement || '',
                            analyticalOverview: data.analyticalOverview || '',
                            examples: data.examples || [],
                            complexityTable: data.complexityTable || [],
                            approaches: data.approaches || []
                        });
                        setLoading(false);
                        return; // Done
                    }
                } catch (e) {
                    console.log("No existing solution found, fetching question metadata...");
                }

                // 2. Fetch question info to pre-fill metadata
                const qInfo = await axios.get(`${API_BASE}/api/admin/question/${id}`, { withCredentials: true });
                if (qInfo.data?.status === 'success') {
                    const qData = qInfo.data.data;
                    setSolution(prev => ({
                        ...prev,
                        questionId: qData.questionId || id,
                        title: qData.title || '',
                        difficulty: qData.difficulty || 'Medium',
                        topics: qData.topics || [],
                        problemStatement: qData.problemStatement || '',
                        platform: qData.platform || 'leetcode'
                    }));
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to fetch existing solution or question info.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchExisting();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSolution(prev => ({ ...prev, [name]: value }));
    };

    const handleTopicChange = (e) => {
        const topics = e.target.value.split(',').map(t => t.trim()).filter(t => t);
        setSolution(prev => ({ ...prev, topics }));
    };

    const handleExampleChange = (index, field, value) => {
        const newExamples = [...solution.examples];
        newExamples[index] = { ...newExamples[index], [field]: value };
        setSolution(prev => ({ ...prev, examples: newExamples }));
    };

    const addExample = () => {
        setSolution(prev => ({ ...prev, examples: [...prev.examples, { input: '', output: '', explanation: '' }] }));
    };

    const removeExample = (index) => {
        setSolution(prev => ({ ...prev, examples: prev.examples.filter((_, i) => i !== index) }));
    };

    const handleApproachChange = (index, field, value) => {
        const newApproaches = [...solution.approaches];
        newApproaches[index] = { ...newApproaches[index], [field]: value };
        setSolution(prev => ({ ...prev, approaches: newApproaches }));
    };

    const handleApproachStepChange = (apprIdx, stepIdx, value) => {
        const newApproaches = [...solution.approaches];
        const newSteps = [...newApproaches[apprIdx].steps];
        newSteps[stepIdx] = value;
        newApproaches[apprIdx].steps = newSteps;
        setSolution(prev => ({ ...prev, approaches: newApproaches }));
    };

    const addStep = (apprIdx) => {
        const newApproaches = [...solution.approaches];
        newApproaches[apprIdx].steps = [...newApproaches[apprIdx].steps, ''];
        setSolution(prev => ({ ...prev, approaches: newApproaches }));
    };

    const handleCodeChange = (apprIdx, lang, value) => {
        const newApproaches = [...solution.approaches];
        newApproaches[apprIdx].codes = { ...newApproaches[apprIdx].codes, [lang]: value };
        setSolution(prev => ({ ...prev, approaches: newApproaches }));
    };

    const handleComplexityChange = (apprIdx, field, value) => {
        const newApproaches = [...solution.approaches];
        newApproaches[apprIdx].complexity = { ...newApproaches[apprIdx].complexity, [field]: value };
        setSolution(prev => ({ ...prev, approaches: newApproaches }));
    };

    const addApproach = () => {
        setSolution(prev => ({
            ...prev,
            approaches: [...prev.approaches, {
                name: '',
                concept: '',
                steps: [],
                complexity: { time: '', space: '' },
                codes: { python: '', javascript: '', cpp: '', java: '' }
            }]
        }));
    };

    const removeApproach = (index) => {
        setSolution(prev => ({ ...prev, approaches: prev.approaches.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await axios.post(`${API_BASE}/api/admin/solution`, solution, { withCredentials: true });
            if (res.data.status === 'success') {
                setMessage('Solution saved successfully!');
                setTimeout(() => navigate(`/solution/${solution.questionId}`), 2000);
            }
        } catch (err) {
            console.error("Save Error:", err);
            setError(err.response?.data?.message || 'Failed to save solution');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || (loading && id)) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Loading Editor...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '80px auto', color: '#eee', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #333' }}>
            <h1 style={{ color: '#ffa116', marginBottom: '1.5rem' }}>{id ? 'Edit' : 'Add'} Solution</h1>

            {message && <div style={{ padding: '1rem', background: 'rgba(0, 200, 83, 0.1)', color: '#00c853', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #00c853' }}>{message}</div>}
            {error && <div style={{ padding: '1rem', background: 'rgba(255, 75, 43, 0.1)', color: '#ff4b2b', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ff4b2b' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Question ID / Title Slug</label>
                        <input
                            type="text"
                            name="questionId"
                            value={solution.questionId}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                            placeholder="e.g. 1 or two-sum"
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Display Title</label>
                        <input
                            type="text"
                            name="title"
                            value={solution.title}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Platform</label>
                        <input
                            type="text"
                            name="platform"
                            value={solution.platform}
                            readOnly
                            style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', color: '#888', borderRadius: '8px', cursor: 'not-allowed' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Difficulty</label>
                        <select
                            name="difficulty"
                            value={solution.difficulty}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Topics (comma separated)</label>
                        <input
                            type="text"
                            value={solution.topics.join(', ')}
                            onChange={handleTopicChange}
                            style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                            placeholder="Array, Hash Table, Greedy"
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Problem Statement (Markdown/Text)</label>
                    <textarea
                        name="problemStatement"
                        value={solution.problemStatement}
                        onChange={handleChange}
                        style={{ width: '100%', minHeight: '150px', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px', lineHeight: '1.6' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem', border: '1px solid #222', padding: '1.5rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Examples</h2>
                        <button type="button" onClick={addExample} style={{ padding: '0.5rem 1rem', background: '#333', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>+ Add Example</button>
                    </div>
                    {solution.examples.map((ex, idx) => (
                        <div key={idx} style={{ background: '#111', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
                            <button type="button" onClick={() => removeExample(idx)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: '#ff4b2b', cursor: 'pointer' }}>Remove</button>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Input</label>
                                <input type="text" value={ex.input} onChange={(e) => handleExampleChange(idx, 'input', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px' }} />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Output</label>
                                <input type="text" value={ex.output} onChange={(e) => handleExampleChange(idx, 'output', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Explanation</label>
                                <textarea value={ex.explanation} onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.4rem', color: '#ffa116' }}>Approaches</h2>
                        <button type="button" onClick={addApproach} style={{ padding: '0.6rem 1.2rem', background: '#ffa116', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>+ Add Approach</button>
                    </div>

                    {solution.approaches.map((appr, aIdx) => (
                        <div key={aIdx} style={{ background: '#111', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1, marginRight: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Approach Name</label>
                                    <input type="text" value={appr.name} onChange={(e) => handleApproachChange(aIdx, 'name', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '8px' }} placeholder="e.g. Brute Force or Sliding Window" />
                                </div>
                                <button type="button" onClick={() => removeApproach(aIdx)} style={{ height: '40px', background: 'transparent', border: '1px solid #ff4b2b', color: '#ff4b2b', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>Delete Approach</button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Concept (High-level explanation)</label>
                                <textarea value={appr.concept} onChange={(e) => handleApproachChange(aIdx, 'concept', e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '8px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time Complexity</label>
                                    <input type="text" value={appr.complexity?.time} onChange={(e) => handleComplexityChange(aIdx, 'time', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '8px' }} placeholder="O(N log N)" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Space Complexity</label>
                                    <input type="text" value={appr.complexity?.space} onChange={(e) => handleComplexityChange(aIdx, 'space', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #444', color: 'white', borderRadius: '8px' }} placeholder="O(1)" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontWeight: 'bold' }}>Algorithm Steps</label>
                                    <button type="button" onClick={() => addStep(aIdx)} style={{ background: '#333', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>+ Add Step</button>
                                </div>
                                {appr.steps.map((step, sIdx) => (
                                    <div key={sIdx} style={{ display: 'flex', gap: '10px', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#888', marginTop: '10px' }}>{sIdx + 1}.</span>
                                        <input type="text" value={step} onChange={(e) => handleApproachStepChange(aIdx, sIdx, e.target.value)} style={{ flex: 1, padding: '0.6rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Code Implementation</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffdb58', marginBottom: '0.3rem' }}>Python</label>
                                        <textarea value={appr.codes?.python} onChange={(e) => handleCodeChange(aIdx, 'python', e.target.value)} style={{ width: '100%', height: '200px', padding: '0.8rem', background: '#080808', border: '1px solid #444', color: '#4db6ac', borderRadius: '8px', fontFamily: 'monospace' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#f7df1e', marginBottom: '0.3rem' }}>JavaScript</label>
                                        <textarea value={appr.codes?.javascript} onChange={(e) => handleCodeChange(aIdx, 'javascript', e.target.value)} style={{ width: '100%', height: '200px', padding: '0.8rem', background: '#080808', border: '1px solid #444', color: '#4db6ac', borderRadius: '8px', fontFamily: 'monospace' }} />
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#00599c', marginBottom: '0.3rem' }}>C++</label>
                                        <textarea value={appr.codes?.cpp} onChange={(e) => handleCodeChange(aIdx, 'cpp', e.target.value)} style={{ width: '100%', height: '200px', padding: '0.8rem', background: '#080808', border: '1px solid #444', color: '#4db6ac', borderRadius: '8px', fontFamily: 'monospace' }} />
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#ed1d25', marginBottom: '0.3rem' }}>Java</label>
                                        <textarea value={appr.codes?.java} onChange={(e) => handleCodeChange(aIdx, 'java', e.target.value)} style={{ width: '100%', height: '200px', padding: '0.8rem', background: '#080808', border: '1px solid #444', color: '#4db6ac', borderRadius: '8px', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ flex: 2, padding: '1rem', background: '#ffa116', color: 'black', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                    >
                        {saving ? 'Saving Solution...' : 'Save Solution to Database'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        style={{ flex: 1, padding: '1rem', background: 'transparent', color: 'white', border: '1px solid #444', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </form >
        </div >
    );
};

export default AdminSolutionEditor;
