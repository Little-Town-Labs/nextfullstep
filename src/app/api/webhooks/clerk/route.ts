import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getRepository } from '@/lib/data-source';
import { UserEntity } from '@/entities/UserEntity';

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Use singleton repository pattern for serverless
      const userRepository = await getRepository(UserEntity);

      // Create new user in database
      const newUser = new UserEntity();
      newUser.clerkUserId = id;
      newUser.email = email_addresses[0]?.email_address || '';
      newUser.name = `${first_name || ''} ${last_name || ''}`.trim() || undefined;
      newUser.profileImageUrl = image_url || undefined;
      newUser.subscriptionTier = 'free';
      newUser.subscriptionStatus = 'active';
      newUser.assessmentsUsed = 0;
      newUser.assessmentsLimit = 1;
      newUser.roadmapsUsed = 0;
      newUser.roadmapsLimit = 1;
      newUser.onboardingCompleted = false;
      newUser.status = 'active';
      newUser.usageResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      await userRepository.save(newUser);

      console.log('User created in database:', id);
    } catch (error) {
      console.error('Error creating user in database:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Use singleton repository pattern for serverless
      const userRepository = await getRepository(UserEntity);
      const user = await userRepository.findOne({ where: { clerkUserId: id } });

      if (user) {
        user.email = email_addresses[0]?.email_address || user.email;
        user.name = `${first_name || ''} ${last_name || ''}`.trim() || user.name;
        user.profileImageUrl = image_url || user.profileImageUrl;

        await userRepository.save(user);
        console.log('User updated in database:', id);
      }
    } catch (error) {
      console.error('Error updating user in database:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Use singleton repository pattern for serverless
      const userRepository = await getRepository(UserEntity);
      const user = await userRepository.findOne({ where: { clerkUserId: id } });

      if (user) {
        // Soft delete - set status to inactive instead of hard delete
        user.status = 'inactive';
        await userRepository.save(user);
        console.log('User soft deleted in database:', id);
      }
    } catch (error) {
      console.error('Error deleting user in database:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
