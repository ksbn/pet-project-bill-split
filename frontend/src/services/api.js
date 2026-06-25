const BASE = "/api";

// Groups

export async function createGroup(name) {
  const res = await fetch(`${BASE}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function getGroup(groupId) {
  const res = await fetch(`${BASE}/groups/id/${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch group");
  return res.json();
}

export async function getGroupByInviteCode(inviteCode) {
  const res = await fetch(`${BASE}/groups/${inviteCode}`);
  if (!res.ok) throw new Error("Group not found");
  return res.json();
}

// MOCK — replace with real fetch when Yan's endpoints are ready:
// GET /api/groups/:id/users
export async function getGroupUsers(groupId) {
  void groupId;
  return mockDelay([]);
}

// MOCK — replace with real fetch when Yan's endpoints are ready:
// POST /api/groups/:id/users
export async function addUserToGroup(groupId, userData) {
  void groupId;
  return mockDelay({
    id: Math.floor(Math.random() * 90000) + 10000,
    name: userData.name,
    email: userData.email ?? "",
  });
}

export async function joinGroupByInviteCode(inviteCode, userData) {
  void inviteCode;
  void userData;
  return mockDelay({ success: true });
}

// Mock (delete when backend is ready)
function mockDelay(value, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}