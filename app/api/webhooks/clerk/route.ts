import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const headerList = await headers()
  const svix_id = headerList.get('svix-id')
  const svix_timestamp = headerList.get('svix-timestamp')
  const svix_signature = headerList.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Invalid headers', { status: 400 })
  }

  const payload = await req.json()
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  
  try {
    const evt = wh.verify(JSON.stringify(payload), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent

    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses.find(e => e.id === evt.data.primary_email_address_id)?.email_address

    if (evt.type === 'user.created') {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: id,
          email: email,
          first_name: first_name,
          last_name: last_name,
          avatar: image_url,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase insert error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    } else if (evt.type === 'user.updated') {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: email,
          first_name: first_name,
          last_name: last_name,
          avatar: image_url
        })
        .eq('user_id', id)

      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }
}

type WebhookEvent = {
  type: string
  data: {
    id: string
    primary_email_address_id: string
    email_addresses: Array<{
      id: string
      email_address: string
    }>
    first_name: string | null
    last_name: string | null
    image_url: string | null
  }
}
