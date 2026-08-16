"use client";

import React from "react";
import { Users, UserPlus, Trash2, X } from "lucide-react";

export default function UserManagementModal({
  isOpen,
  currentUser,
  registeredUsers,
  newUserForm,
  setNewUserForm,
  handleCreateUserSubmit,
  handleDeleteUser,
  onClose,
}) {
  if (!isOpen || currentUser?.role !== "Super User") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-lg">
              Super User: System Account Manager
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <form
            onSubmit={handleCreateUserSubmit}
            className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-3"
          >
            <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wider flex items-center gap-1">
              <UserPlus className="w-4 h-4 text-purple-700" />
              Create New Staff Account & Assign Privileges
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Downey"
                  value={newUserForm.name}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Login Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. robert"
                  value={newUserForm.username}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Login PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. 1234"
                  value={newUserForm.pin}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      pin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Assign Role / Privilege *
                </label>

                <select
                  value={newUserForm.role}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-600"
                >
                  <option value="Super User">Super User (Full Control)</option>
                  <option value="Manager">
                    Manager (Purchase Orders & Admin)
                  </option>
                  <option value="Mechanic">
                    Mechanic (3D Inspection & Workshop)
                  </option>
                  <option value="Cashier">Cashier (Intake & Billing)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-lg shadow"
            >
              Create Account
            </button>
          </form>

          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">
              Existing System Users ({registeredUsers.length})
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-900 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Role / Privileges</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-bold">
                  {registeredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-900">{u.name}</td>

                      <td className="p-3 font-mono text-blue-700">
                        {u.username}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${
                            u.role === "Super User"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {u.username !== "superuser" && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
