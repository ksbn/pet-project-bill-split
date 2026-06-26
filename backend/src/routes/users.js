import { Router } from "express";
import { addUserToGroup, getUsersByGroup } from "../services/users.js";

const router = Router({ mergeParams: true });

/* POST /api/groups/:id/users */
router.post("/", async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const { name, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newUser = await addUserToGroup({
      group_id,
      name,
      email,
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/groups/:id/users */
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
