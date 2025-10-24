import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import EmptyState from './components/EmptyState';
import { loadUsers, saveUsers } from './utils/storage';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    try {
      const loaded = loadUsers();
      if (loaded) setUsers(loaded);
      else setUsers([]);
    } catch (e) {
      setError('Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (users !== null) saveUsers(users);
  }, [users]);

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function handleEdit(user) {
    setEditing(user);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!confirm('Delete user?')) return;
    setUsers(u => u.filter(x => x.id !== id));
  }

  function handleSave(data) {
    if (editing) setUsers(prev => prev.map(p => (p.id === editing.id ? { ...p, ...data } : p)));
    else setUsers(prev => [{ id: uid(), ...data }, ...prev]);
    setShowForm(false);
    setEditing(null);
  }

  const filtered = (users || []).filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <Header onAdd={handleAdd} query={query} setQuery={setQuery} />
        {loading && <div className="text-center py-12">Loading...</div>}
        {error && <div className="text-center py-12 text-red-600">{error}</div>}
        {!loading && !error && users && users.length === 0 && <EmptyState onAdd={handleAdd} />}
        {!loading && !error && users && users.length > 0 && (
          filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No results for “{query}”</div>
          ) : (
            <UserList users={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          )
        )}
        {showForm && <UserForm initial={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} />}
      </div>
    </div>
  );
}
