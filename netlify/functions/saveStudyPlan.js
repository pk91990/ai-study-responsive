import { neon } from "@netlify/neon";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { userId, plan } = JSON.parse(event.body);
    const sql = neon();

    // Clear old plan
    await sql(`DELETE FROM study_plans WHERE user_id = $1`, [userId]);

    // Insert new plan
    for (const p of plan) {
      await sql(
        `INSERT INTO study_plans (user_id, day, date, task, status, risk)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          p.day,
          p.date || null,
          p.task,
          p.status,
          p.risk || false
        ]
      );
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: e.message };
  }
};
