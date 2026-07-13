"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle, Edit3, Trash2, ExternalLink, X, PlusCircle } from "lucide-react";

export default function AdminDashboard({ initialSubtopics, topics = [] }: { initialSubtopics: any[], topics?: any[] }) {
  const [subtopics, setSubtopics] = useState(initialSubtopics);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Editor Modal State
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [editContent, setEditContent] = useState("");

  // Create Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [createData, setCreateData] = useState({ topicId: topics[0]?.id || "", title: "", slug: "", content: "# New Article\n\nWrite your content here..." });

  const handleCreate = async () => {
    if (!createData.topicId || !createData.title || !createData.slug || !createData.content) {
      alert("Please fill in all fields.");
      return;
    }
    setLoadingId('create-new');
    try {
      const selectedTopic = topics.find(t => t.id === createData.topicId);
      if (!selectedTopic) return;

      const res = await fetch("/docs/api/admin/subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: 'create', 
          topicId: createData.topicId,
          title: createData.title,
          slug: `${selectedTopic.slug}-${createData.slug}`,
          content: createData.content 
        })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAction = async (id: string, action: string, extraData: any = {}) => {
    setLoadingId(`${id}-${action}`);
    try {
      const res = await fetch("/docs/api/admin/subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, ...extraData })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (action === 'approve') {
          setSubtopics(subs => subs.map(s => s.id === id ? { ...s, status: 'Published' } : s));
        } else if (action === 'delete') {
          setSubtopics(subs => subs.filter(s => s.id !== id));
        } else if (action === 'regenerate') {
          window.location.reload(); // Reload to fetch fresh DB data
        } else if (action === 'update') {
          setSubtopics(subs => subs.map(s => s.id === id ? { ...s, content: extraData.content } : s));
          setEditingSub(null);
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const openEditor = (sub: any) => {
    setEditingSub(sub);
    setEditContent(sub.content);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07090e] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage, edit, and approve AI-generated documentation drafts.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
            >
              <PlusCircle size={16} /> Write New Article
            </button>
            <div className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full font-bold text-sm">
              {subtopics.filter(s => s.status === 'Draft').length} Pending Drafts
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-[#0e111a] border border-gray-200 dark:border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0c10] border-b border-gray-200 dark:border-[#1e293b] text-gray-500 font-semibold uppercase tracking-wider text-xs">
                <th className="p-4">Article Title</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]">
              {subtopics.map((sub) => {
                const slug = `${sub.topic.slug}-${sub.slug.split('-').slice(2).join('-')}`; // Quick UI slug fix if nested
                const realSlug = sub.slug;
                
                return (
                <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-[#121622] transition-colors group">
                  <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">
                    {sub.title}
                    <div className="text-xs text-gray-400 font-normal mt-1">{realSlug}</div>
                  </td>
                  <td className="p-4 text-gray-500">{sub.topic.title}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      sub.status === 'Draft' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500' 
                        : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <a 
                      href={`/concept/${realSlug}`} 
                      target="_blank" 
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button 
                      onClick={() => openEditor(sub)}
                      className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                      title="Edit Markdown"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleAction(sub.id, 'regenerate', { topicSlug: sub.topic.slug, subtopicSlug: sub.slug.replace(`${sub.topic.slug}-`, '') })}
                      disabled={loadingId === `${sub.id}-regenerate`}
                      className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Regenerate with AI"
                    >
                      <RefreshCw size={18} className={loadingId === `${sub.id}-regenerate` ? 'animate-spin' : ''} />
                    </button>
                    {sub.status === 'Draft' && (
                      <button 
                        onClick={() => handleAction(sub.id, 'approve')}
                        disabled={loadingId === `${sub.id}-approve`}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve & Publish"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleAction(sub.id, 'delete')}
                      disabled={loadingId === `${sub.id}-delete`}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 ml-2"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Editor Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0a0c10] border border-gray-200 dark:border-[#1e293b] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0e111a]">
              <h2 className="font-bold text-lg dark:text-white">Editing: {editingSub.title}</h2>
              <button onClick={() => setEditingSub(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full p-4 bg-gray-50 dark:bg-[#07090e] border border-gray-200 dark:border-[#1e293b] rounded-xl font-mono text-sm dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0e111a] flex justify-end gap-3">
              <button onClick={() => setEditingSub(null)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => handleAction(editingSub.id, 'update', { content: editContent })}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Create Article Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0a0c10] border border-gray-200 dark:border-[#1e293b] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0e111a]">
              <h2 className="font-bold text-lg dark:text-white">Write New Article</h2>
              <button onClick={() => setIsCreating(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select Topic</label>
                  <select 
                    value={createData.topicId} 
                    onChange={e => setCreateData({...createData, topicId: e.target.value})}
                    className="w-full p-2 bg-gray-50 dark:bg-[#121622] border border-gray-200 dark:border-[#1e293b] rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Article Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Advanced Sliding Window"
                    value={createData.title}
                    onChange={e => setCreateData({...createData, title: e.target.value})}
                    className="w-full p-2 bg-gray-50 dark:bg-[#121622] border border-gray-200 dark:border-[#1e293b] rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">URL Slug (e.g. advanced-sliding-window)</label>
                <input 
                  type="text" 
                  placeholder="advanced-sliding-window"
                  value={createData.slug}
                  onChange={e => setCreateData({...createData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                  className="w-full p-2 bg-gray-50 dark:bg-[#121622] border border-gray-200 dark:border-[#1e293b] rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="h-96 pt-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Markdown Content</label>
                <textarea 
                  value={createData.content}
                  onChange={e => setCreateData({...createData, content: e.target.value})}
                  className="w-full h-full p-4 bg-gray-50 dark:bg-[#07090e] border border-gray-200 dark:border-[#1e293b] rounded-xl font-mono text-sm dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0e111a] flex justify-end gap-3">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={loadingId === 'create-new'}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
