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
  // Step 1: get the group by invite code to retrieve its ID
  const group = await getGroupByInviteCode(inviteCode);

  // Step 2: add the user to that group using the existing endpoint
  const user = await addUserToGroup(group.id, userData);

  return { ...user, group_id: group.id };
}