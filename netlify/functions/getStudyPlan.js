import { neon } from "@netlify/neon";

export const handler = async (event) => {
  const userId = event.queryStringParameters?.userId || "local-user";
  const sql = neon();

  const rows = await sql(
    `SELECT day, date, task, status, risk
     FROM study_plans
     WHERE user_id = $1
     ORDER BY id`,
    [userId]
  );

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
