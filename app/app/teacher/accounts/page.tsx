'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users, Link2, UserCog, Pencil, KeyRound, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import ErrorText from '@/components/ErrorText';
import type { Grade } from '@/lib/types';
import AppFooter from '@/components/AppFooter';

interface ProfileRow {
  id: string;
  name: string;
  username: string | null;
  grade_id: string | null;
  parent_id: string | null;
}

function gradeNameOf(grades: Grade[], id: string | null) {
  return grades.find((g) => g.id === id)?.name ?? '—';
}

function CreateAccountForm({
  role,
  grades,
  onCreated,
}: {
  role: 'student' | 'parent';
  grades: Grade[];
  onCreated: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gradeCode, setGradeCode] = useState<string>(grades[0]?.code ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const res = await fetch('/api/admin/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, username, password, name, gradeCode: role === 'student' ? gradeCode : undefined }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'An error occurred');
      setSaving(false);
      return;
    }

    setSuccess(`Account "${username}" created — share the username and password with the ${role === 'student' ? 'student' : 'parent'}.`);
    setUsername('');
    setPassword('');
    setName('');
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Display name"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
      />
      <div className="flex gap-3">
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
          placeholder="Username (e.g. an123)"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
        />
        <input
          required
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (6+ characters)"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
        />
      </div>
      {role === 'student' && (
        <select
          value={gradeCode}
          onChange={(e) => setGradeCode(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
        >
          {grades.map((g) => <option key={g.id} value={g.code}>{g.name}</option>)}
        </select>
      )}
      {error && <ErrorText message={error} />}
      {success && <p className="text-sm text-emerald-600 font-semibold">{success}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
      >
        {saving ? 'Creating...' : 'Create account'}
      </button>
    </form>
  );
}

function AccountManageList({
  role,
  rows,
  grades,
  onChanged,
}: {
  role: 'student' | 'parent';
  rows: ProfileRow[];
  grades: Grade[];
  onChanged: () => Promise<void>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'password' | null>(null);
  const [editName, setEditName] = useState('');
  const [editGradeId, setEditGradeId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [rowSuccess, setRowSuccess] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const close = () => {
    setExpandedId(null);
    setMode(null);
  };

  const openEdit = (row: ProfileRow) => {
    if (expandedId === row.id && mode === 'edit') {
      close();
      return;
    }
    setExpandedId(row.id);
    setMode('edit');
    setEditName(row.name);
    setEditGradeId(row.grade_id ?? '');
    setRowError(null);
    setRowSuccess(null);
  };

  const openPassword = (row: ProfileRow) => {
    if (expandedId === row.id && mode === 'password') {
      close();
      return;
    }
    setExpandedId(row.id);
    setMode('password');
    setNewPassword('');
    setRowError(null);
    setRowSuccess(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      setRowError('Name cannot be empty');
      return;
    }
    setBusy(true);
    setRowError(null);
    const supabase = createClient();
    const updates: Record<string, unknown> = { name: editName.trim() };
    if (role === 'student') updates.grade_id = editGradeId || null;
    const { error } = await supabase.from('greenleaf_profiles').update(updates).eq('id', id);
    setBusy(false);
    if (error) {
      setRowError('Failed to save: ' + error.message);
      return;
    }
    close();
    await onChanged();
  };

  const handleResetPassword = async (id: string) => {
    if (!newPassword || newPassword.length < 6) {
      setRowError('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    setRowError(null);
    setRowSuccess(null);
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, newPassword }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setRowError(data.error ?? 'An error occurred');
      return;
    }
    setNewPassword('');
    setRowSuccess('Password has been reset — share the new password with the student/parent.');
  };

  const handleDelete = async (row: ProfileRow) => {
    if (!confirm(`Delete account "${row.name}"? All related learning data will be permanently deleted and cannot be recovered.`)) return;
    setBusy(true);
    setListError(null);
    const res = await fetch('/api/admin/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: row.id }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setListError(data.error ?? 'An error occurred');
      return;
    }
    if (expandedId === row.id) close();
    await onChanged();
  };

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No {role === 'student' ? 'student' : 'parent'} accounts yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-xl bg-gray-50 overflow-hidden">
          <div className="flex items-center gap-2 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{row.name}</p>
              <p className="text-xs text-gray-400">
                {row.username ?? '—'}
                {role === 'student' && ` · ${gradeNameOf(grades, row.grade_id)}`}
              </p>
            </div>
            <button onClick={() => openEdit(row)} className="text-gray-300 hover:text-[#3A7D44] transition-colors shrink-0" aria-label="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => openPassword(row)} className="text-gray-300 hover:text-amber-500 transition-colors shrink-0" aria-label="Reset password">
              <KeyRound className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(row)} disabled={busy} className="text-gray-300 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50" aria-label="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {expandedId === row.id && mode === 'edit' && (
            <div className="px-3 pb-3 space-y-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              />
              {role === 'student' && (
                <select
                  value={editGradeId}
                  onChange={(e) => setEditGradeId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                >
                  {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}
              {rowError && <ErrorText message={rowError} />}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(row.id)}
                  disabled={busy}
                  className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors"
                >
                  {busy ? 'Saving...' : 'Save'}
                </button>
                <button onClick={close} className="text-gray-400 hover:text-gray-600 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {expandedId === row.id && mode === 'password' && (
            <div className="px-3 pb-3 space-y-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (6+ characters)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              />
              {rowError && <ErrorText message={rowError} />}
              {rowSuccess && <p className="text-xs text-emerald-600 font-semibold">{rowSuccess}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleResetPassword(row.id)}
                  disabled={busy}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors"
                >
                  {busy ? 'Saving...' : 'Reset password'}
                </button>
                <button onClick={close} className="text-gray-400 hover:text-gray-600 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {listError && <ErrorText message={listError} />}
    </div>
  );
}

export default function TeacherAccountsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<ProfileRow[]>([]);
  const [parents, setParents] = useState<ProfileRow[]>([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [checkedStudentIds, setCheckedStudentIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [linkMsg, setLinkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const [{ data: gradesData }, { data: studentsData }, { data: parentsData }] = await Promise.all([
      supabase.from('greenleaf_grades').select('*').order('order_index'),
      supabase.from('greenleaf_profiles').select('id, name, username, grade_id, parent_id').eq('role', 'student').order('name'),
      supabase.from('greenleaf_profiles').select('id, name, username, grade_id, parent_id').eq('role', 'parent').order('name'),
    ]);
    setGrades(gradesData ?? []);
    setStudents((studentsData as ProfileRow[]) ?? []);
    setParents((parentsData as ProfileRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedParentId) {
      setCheckedStudentIds(new Set());
      return;
    }
    setCheckedStudentIds(new Set(students.filter((s) => s.parent_id === selectedParentId).map((s) => s.id)));
  }, [selectedParentId, students]);

  const toggleStudent = (id: string) => {
    setCheckedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveLinks = async () => {
    if (!selectedParentId) return;
    setSaving(true);
    setLinkMsg(null);
    const supabase = createClient();

    const toLink = students.filter((s) => checkedStudentIds.has(s.id) && s.parent_id !== selectedParentId);
    const toUnlink = students.filter((s) => !checkedStudentIds.has(s.id) && s.parent_id === selectedParentId);

    await Promise.all([
      ...toLink.map((s) => supabase.from('greenleaf_profiles').update({ parent_id: selectedParentId }).eq('id', s.id)),
      ...toUnlink.map((s) => supabase.from('greenleaf_profiles').update({ parent_id: null }).eq('id', s.id)),
    ]);

    setLinkMsg('Parent-student links saved.');
    await load();
    setSaving(false);
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="accounts" />

        <div className="rounded-3xl p-1 bg-gradient-to-br from-sky-400 to-blue-500 shadow-md">
          <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[#3A7D44]">Create Student Account</h2>
            </div>
            <p className="text-xs text-gray-400 -mt-2">No email needed — students log in with username + password.</p>
            {grades.length > 0 && <CreateAccountForm role="student" grades={grades} onCreated={load} />}
          </div>
        </div>

        <div className="rounded-3xl p-1 bg-gradient-to-br from-violet-400 to-purple-500 shadow-md">
          <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[#3A7D44]">Create Parent Account</h2>
            </div>
            <p className="text-xs text-gray-400 -mt-2">After creating, link the parent to their student(s) in the section below.</p>
            <CreateAccountForm role="parent" grades={grades} onCreated={load} />
          </div>
        </div>

        <div className="rounded-3xl p-1 bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
          <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[#3A7D44]">Link Parent ↔ Student</h2>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : parents.length === 0 ? (
              <p className="text-sm text-gray-400">No parent accounts yet — create one in the section above first.</p>
            ) : (
              <>
                <select
                  value={selectedParentId}
                  onChange={(e) => { setSelectedParentId(e.target.value); setLinkMsg(null); }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                >
                  <option value="">Select a parent...</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} {p.username ? `(${p.username})` : ''}</option>
                  ))}
                </select>

                {selectedParentId && (
                  <>
                    <p className="text-xs text-gray-400">Select students for this parent:</p>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {students.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checkedStudentIds.has(s.id)}
                            onChange={() => toggleStudent(s.id)}
                            className="w-4 h-4 accent-[#3A7D44]"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700">{s.name}</p>
                            <p className="text-xs text-gray-400">
                              {gradeNameOf(grades, s.grade_id)}
                              {s.parent_id && s.parent_id !== selectedParentId && ' · already linked to another parent'}
                            </p>
                          </div>
                        </label>
                      ))}
                      {students.length === 0 && <p className="text-sm text-gray-400">No students yet.</p>}
                    </div>
                    {linkMsg && <p className="text-sm text-emerald-600 font-semibold">{linkMsg}</p>}
                    <button
                      onClick={handleSaveLinks}
                      disabled={saving}
                      className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save links'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-3xl p-1 bg-gradient-to-br from-rose-400 to-orange-400 shadow-md">
          <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white shrink-0">
                <UserCog className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[#3A7D44]">Manage Accounts</h2>
            </div>
            <p className="text-xs text-gray-400 -mt-2">Edit name/level, reset password, or delete student/parent accounts.</p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Students</p>
                  <AccountManageList role="student" rows={students} grades={grades} onChanged={load} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Parents</p>
                  <AccountManageList role="parent" rows={parents} grades={grades} onChanged={load} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
