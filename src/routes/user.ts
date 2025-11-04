import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

export default function userRouter(prisma: PrismaClient) {
    const router = Router()
    // POST /users
    /**
     * @openapi
     * /users:
     *  post:
     *     summary: Create a user
     *     tags:
     *       - Users
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *             required:
     *               - email
     *               - password
     *             example:
     *               email: "test@example.com"
     *               password: "password"
     *     responses:
     *       201:
     *         description: Created
     *         content:
     *           application/json:
     *       400:
     *         description: Bad Request
     *         content:
     *           application/json:

     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:

     */
    router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const name = email.split("@")[0];
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, password, name },
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
  console.log("user", user);
  console.log("token", token);
  res.status(201).json({ user, token });
  });

  return router;
}
