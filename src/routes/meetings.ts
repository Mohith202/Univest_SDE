import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { extractSummaryAndActions } from "../model_call/geminiApi";
import { storeMeetingVector } from "../utils/storeEmbedding";

export default function meetingRouter(prisma: PrismaClient) {
  const router = Router();

  // POST /meetings
  /**
   * @openapi
   * /meetings:
   *   post:
   *     summary: Create a meeting summary from a transcript
   *     tags:
   *       - Meetings
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMeetingRequest'
   *         example:
   *           title: "Sprint Planning"
   *           transcript: "Team discussed project deadlines..."
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Meeting'
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post("/", async (req, res) => {
    const { title, transcript } = req.body;
    if (!title || !transcript) return res.status(400).json({ error: "title and transcript required" });

    try {
      const authUser = (req as any).user as { userId?: string } | undefined;
      const userId = authUser?.userId;
      if (!userId) return res.status(401).json({ error: "unauthorized" });

      const result = await extractSummaryAndActions(title,transcript);

      const created = await prisma.meeting.create({
        data: {
          title,
          transcript,
          summary: result.summary,
          actionItems: result.actionItems,
          userId: userId,
        },
      });

      await storeMeetingVector({
        meetingId: created.id,
        userId: userId,
        title: title,
        embedding: result.embedding || [],
        createdAt: new Date(),
      });

      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /meetings
  /**
   * @openapi
   * /meetings:
   *   get:
   *     summary: List meetings
   *     tags:
   *       - Meetings
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Meeting'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get("/", async (req, res) => {
    try {
      const items = await prisma.meeting.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
