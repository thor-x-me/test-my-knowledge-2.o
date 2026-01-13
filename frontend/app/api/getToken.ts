import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { getToken } = await auth()

  const template = 'Postman'

  const token = await getToken({ template })

  return Response.json({ token })
}