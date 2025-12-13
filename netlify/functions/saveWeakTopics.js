import { neon } from "@netlify/neon";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { userId, topics } = JSON.parse(event.body);
    const sql = neon();

    for (const topic of topics) {
      await sql(
        `
        INSERT INTO weak_topics (user_id, topic, mistake_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id, topic)
        DO UPDATE SET
          mistake_count = weak_topics.mistake_count + 1,
          updated_at = now()
        `,
        [userId, topic]
      );
    }

    return { statusCode: 200, body: JSON.stringify({ saved: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: e.message };
  }
};
