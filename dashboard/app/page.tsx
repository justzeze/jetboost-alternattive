'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Check, Trash2, BarChart3, Users, Heart, Activity } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalWishlists: number;
  totalEvents: number;
  recentLogins: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'stats'>('overview');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadStats(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadStats = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName || !newProjectDomain) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, domain: newProjectDomain })
      });
      const data = await res.json();
      if (data.success) {
        setProjects([...projects, data.project]);
        setSelectedProject(data.project);
        setShowNewProject(false);
        setNewProjectName('');
        setNewProjectDomain('');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter(p => p.id !== id));
        if (selectedProject?.id === id) {
          setSelectedProject(projects[0] || null);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getWidgetCode = () => {
    if (!selectedProject) return '';
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<!-- Jetboost Alternative Widget -->
<script>
  window.JetboostConfig = {
    apiKey: '${selectedProject.apiKey}',
    apiUrl: '${baseUrl}/api'
  };
</script>
<script src="${baseUrl}/widget.js"></script>`;
  };

  const getAuthExampleCode = () => {
    return `<!-- Login Form Example -->
<form id="login-form">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await Jetboost.login(email, password);
  if (result.success) {
    console.log('Logged in!', result.user);
  }
});
</script>`;
  };

  const getWishlistExampleCode = () => {
    return `<!-- Wishlist Button Example -->
<button onclick="toggleWishlist('product-123')" id="wishlist-btn">
  Add to Wishlist
</button>

<script>
async function toggleWishlist(itemId) {
  const inWishlist = await Jetboost.isInWishlist(itemId);
  
  if (inWishlist) {
    await Jetboost.removeFromWishlist(itemId);
    document.getElementById('wishlist-btn').textContent = 'Add to Wishlist';
  } else {
    await Jetboost.addToWishlist(itemId, { name: 'Product Name' });
    document.getElementById('wishlist-btn').textContent = 'Remove from Wishlist';
  }
}
</script>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jetboost Alternative</h1>
              <p className="text-sm text-gray-600">Free Webflow Authentication & Wishlists</p>
            </div>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Projects</h2>
              <div className="space-y-2">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                        <p className="text-xs text-gray-500 truncate">{project.domain}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedProject ? (
              <>
                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'overview'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'code'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Integration Code
                      </button>
                      <button
                        onClick={() => setActiveTab('stats')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'stats'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Statistics
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                              <p className="text-sm text-gray-900">{selectedProject.name}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                              <p className="text-sm text-gray-900">{selectedProject.domain}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono">
                                  {selectedProject.apiKey}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(selectedProject.apiKey, 'apiKey')}
                                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  {copiedKey === 'apiKey' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {stats && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                  <Users className="w-8 h-8 text-blue-600" />
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                                <div className="flex items-center gap-3">
                                  <Heart className="w-8 h-8 text-pink-600" />
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalWishlists}</p>
                                    <p className="text-sm text-gray-600">Wishlist Items</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3">
                                  <Activity className="w-8 h-8 text-green-600" />
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.recentLogins}</p>
                                    <p className="text-sm text-gray-600">Logins (24h)</p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-3">
                                  <BarChart3 className="w-8 h-8 text-purple-600" />
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                                    <p className="text-sm text-gray-600">Total Events</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'code' && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Widget Installation</h3>
                            <button
                              onClick={() => copyToClipboard(getWidgetCode(), 'widget')}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {copiedKey === 'widget' ? (
                                <>
                                  <Check className="w-4 h-4 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Add this code to your Webflow site before the closing &lt;/body&gt; tag</p>
                          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                            <code>{getWidgetCode()}</code>
                          </pre>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Authentication Example</h3>
                            <button
                              onClick={() => copyToClipboard(getAuthExampleCode(), 'auth')}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {copiedKey === 'auth' ? (
                                <>
                                  <Check className="w-4 h-4 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                            <code>{getAuthExampleCode()}</code>
                          </pre>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Wishlist Example</h3>
                            <button
                              onClick={() => copyToClipboard(getWishlistExampleCode(), 'wishlist')}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {copiedKey === 'wishlist' ? (
                                <>
                                  <Check className="w-4 h-4 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                            <code>{getWishlistExampleCode()}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {activeTab === 'stats' && stats && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Registered Users</p>
                                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                                </div>
                                <Users className="w-12 h-12 text-blue-600" />
                              </div>
                            </div>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Wishlist Items</p>
                                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalWishlists}</p>
                                </div>
                                <Heart className="w-12 h-12 text-pink-600" />
                              </div>
                            </div>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Recent Logins (24h)</p>
                                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.recentLogins}</p>
                                </div>
                                <Activity className="w-12 h-12 text-green-600" />
                              </div>
                            </div>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Events Tracked</p>
                                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
                                </div>
                                <BarChart3 className="w-12 h-12 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">No projects yet. Create your first project to get started!</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Webflow Site"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mysite.webflow.io"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewProject(false);
                    setNewProjectName('');
                    setNewProjectDomain('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
