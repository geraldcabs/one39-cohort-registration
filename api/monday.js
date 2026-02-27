export default async function handler(req, res) {
  if (req.query.secret !== 'creativecircle-admin-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = `
    query {
      boards(ids: [${process.env.MONDAY_BOARD_ID}]) {
        name
        columns {
          id
          title
        }
        groups {
          id
          title
        }
        items_page {
          items {
            id
            name
            column_values {
              column { title id }
              text
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.MONDAY_API_KEY,
      "API-Version": "2024-01"
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  res.status(200).json(data);
}