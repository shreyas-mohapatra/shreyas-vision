import { Request, Response, NextFunction } from 'express';
import { withUser } from '../db/withUser.js';
import { AppError } from '../utils/AppError.js';
import { generateText } from '../services/gemini.js';
import { CHAT_SYSTEM_PROMPT } from '../prompts/chat.js';

export async function getScanChat(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const messages = await withUser(userId, async (client) => {
      // Verify scan exists
      const scan = await client.query('SELECT id FROM scans WHERE id = $1 AND user_id = $2', [
        id,
        userId,
      ]);
      if (scan.rows.length === 0) return null;

      const result = await client.query(
        `SELECT id, role, content, created_at
         FROM chat_messages
         WHERE scan_id = $1 AND user_id = $2
         ORDER BY created_at ASC`,
        [id, userId]
      );
      return result.rows;
    });

    if (!messages) {
      throw new AppError('Scan not found', 404, 'SCAN_NOT_FOUND');
    }

    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function sendScanChatMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { message } = req.body;

    const scanData = await withUser(userId, async (client) => {
      const scanRes = await client.query(
        `SELECT id, crop_name, growth_stage, location, diagnosis_json, treatment_json, language
         FROM scans
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (scanRes.rows.length === 0) return null;

      const historyRes = await client.query(
        `SELECT role, content
         FROM chat_messages
         WHERE scan_id = $1 AND user_id = $2
         ORDER BY created_at DESC
         LIMIT 6`,
        [id, userId]
      );

      return {
        scan: scanRes.rows[0],
        recentHistory: historyRes.rows.reverse(),
      };
    });

    if (!scanData) {
      throw new AppError('Scan not found', 404, 'SCAN_NOT_FOUND');
    }

    const { scan, recentHistory } = scanData;
    const cleanUserMsg = message.replace(/<\/?user_message>/g, '');

    // Prepare prompt with grounded scan context
    const contextPrompt = `SCAN CONTEXT (ground truth): ${JSON.stringify(scan.diagnosis_json)}
Treatment Plan: ${JSON.stringify(scan.treatment_json)}
Field: crop=${scan.crop_name}, stage=${scan.growth_stage}, location=${scan.location}
Recent chat: ${JSON.stringify(recentHistory)}
Language: ${scan.language || req.user!.language || 'en'}
<user_message>${cleanUserMsg}</user_message>`;

    // Call Gemini for grounded response
    const assistantReply = await generateText({
      system: CHAT_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
      temperature: 0.4,
      userId,
      endpoint: 'chat',
    });

    // Store user message & assistant reply in chat_messages
    const messages = await withUser(userId, async (client) => {
      await client.query(
        `INSERT INTO chat_messages (scan_id, user_id, role, content)
         VALUES ($1, $2, 'user', $3)`,
        [id, userId, message]
      );

      const replyRes = await client.query(
        `INSERT INTO chat_messages (scan_id, user_id, role, content)
         VALUES ($1, $2, 'assistant', $3)
         RETURNING id, role, content, created_at`,
        [id, userId, assistantReply]
      );

      return replyRes.rows[0];
    });

    res.status(201).json({ reply: messages });
  } catch (err) {
    next(err);
  }
}
