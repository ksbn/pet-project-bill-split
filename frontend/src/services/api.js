const BASE = "/api";

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

export async function getGroupUsers(groupId) {
  const res = await fetch(`${BASE}/groups/${groupId}/users`);
  if (!res.ok) throw new Error("Failed to fetch group users");
  return res.json();
}

export async function addUserToGroup(groupId, userData) {
  const res = await fetch(`${BASE}/groups/${groupId}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to add user");
  return res.json();
}

export async function joinGroupByInviteCode(inviteCode, userData) {
  const res = await fetch(`${BASE}/groups/${inviteCode}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to join group");
  return res.json();
}