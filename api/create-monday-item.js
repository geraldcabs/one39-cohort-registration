async function getOrCreateGroup(coachName) {
  const query = `
    query {
      boards(ids: [${process.env.MONDAY_BOARD_ID}]) {
        groups { id title }
      }
    }
  `;

  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  const groups = data.data.boards[0].groups;
  const match = groups.find(g => g.title.toLowerCase() === coachName.toLowerCase());

  if (match) return match.id;

  const createGroup = `
    mutation {
      create_group(board_id: ${process.env.MONDAY_BOARD_ID}, group_name: "${coachName}") {
        id
      }
    }
  `;

  const createRes = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: createGroup }),
  });

  const createData = await createRes.json();
  return createData.data.create_group.id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, coach, churchName, position } = req.body;

  if (!name || !email || !coach) {
    return res.status(400).json({ error: 'Name, email, and coach are required' });
  }

  try {
    const groupId = await getOrCreateGroup(coach);
    const today = new Date().toISOString().split('T')[0];

    const columnValues = {
      "email_mm0pqws": { "email": email, "text": email },
      "phone_mm0p7k3y": { "phone": phone, "countryShortName": "US" },
      "date_mm0ptyex": { "date": today },
      "date_mm0pa9c9": { "date": today },
      "color_mm14can9": { "label": "Abandoned" },
      "text_mm0zpx5": churchName || '',
      "text_mm133myq": coach,
    };

    const mutation = `
      mutation {
        create_item(
          board_id: ${process.env.MONDAY_BOARD_ID},
          group_id: "${groupId}",
          item_name: "${name}",
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;

    const mondayRes = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_KEY,
        'API-Version': '2024-01',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const mondayData = await mondayRes.json();

    if (mondayData.errors) {
      console.error('❌ Monday.com error:', JSON.stringify(mondayData.errors));
      return res.status(500).json({ error: 'Failed to create Monday.com item' });
    }

    const itemId = mondayData.data.create_item.id;
    console.log('✅ Monday.com item created (Abandoned):', itemId);

    return res.status(200).json({ success: true, mondayItemId: itemId });
  } catch (err) {
    console.error('❌ Monday.com create error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
