import { neon } from "@netlify/neon";

export const handler = async (event) => {
  const userId = event.queryStringParameters?.userId || "local-user";
  const sql = neon();

  const rows = await sql(
    `SELECT topic, mistake_count
     FROM weak_topics
     WHERE user_id = $1
     ORDER BY mistake_count DESC`,
    [userId]
  );

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
