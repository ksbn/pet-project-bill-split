import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Alice", role: "Admin" },
    { id: 2, name: "Bob", role: "User" }
  ]);
});

export default router;