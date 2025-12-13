import { neon } from "@netlify/neon";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { userId, subject, topic, score, total, percentage } =
      JSON.parse(event.body);

    const sql = neon();

    await sql(
      `
      INSERT INTO quiz_results
      (user_id, subject, topic, score, total, percentage)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [userId, subject, topic, score, total, percentage]
    );

    return { statusCode: 200, body: JSON.stringify({ saved: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: e.message };
  }
};
