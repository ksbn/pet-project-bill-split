import { Router } from "express";
import { addUserToGroup, getUsersByGroup } from "../services/users.js";
import { broadcast } from '../sse/store.js'

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const { name, email, revolut_link } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newUser = await addUserToGroup({
      group_id,
      name,
      email,
      revolut_link
    });
    return res.status(201).json(newUser);
    broadcast(Number(req.params.id), 'member_added', newUser)
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const users = await getUsersByGroup(group_id);
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
