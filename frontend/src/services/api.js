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
 