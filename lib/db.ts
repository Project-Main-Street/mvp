import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function getProfiles() {
  const profiles = await sql`
    SELECT id, name, email, image, "createdAt"
    FROM profiles   
  `;
  return profiles;
}

export async function getBusinesses() {
  const businesses = await sql`
    SELECT id, name, "createdAt"
    FROM businesses   
  `;
  return businesses;
}

export async function getBusinessById(id: string) {
  const business = await sql`
    SELECT
      b.id,
      b.name,
      b."createdAt",
      row_to_json(p) AS owner
    FROM businesses b
    LEFT JOIN profiles p ON b.owner = p.id
    WHERE b.id = ${id}
    LIMIT 1
  `;
  return business[0];
}