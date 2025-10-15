import { AppDataSource } from './data-source';
import { UserEntity } from '@/entities/UserEntity';

/**
 * Get user from database by Clerk ID
 */
export async function getUserByClerkId(clerkUserId: string): Promise<UserEntity | null> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const userRepository = AppDataSource.getRepository(UserEntity);
  return await userRepository.findOne({ where: { clerkUserId } });
}

/**
 * Check if user can create a new assessment
 */
export async function checkAssessmentLimit(clerkUserId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: string;
}> {
  const user = await getUserByClerkId(clerkUserId);

  if (!user) {
    return { allowed: false, current: 0, limit: 0, tier: 'none' };
  }

  // Reset usage if period has expired
  if (user.usageResetAt && new Date() > user.usageResetAt) {
    user.assessmentsUsed = 0;
    user.usageResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const userRepository = AppDataSource.getRepository(UserEntity);
    await userRepository.save(user);
  }

  // Pro tier has unlimited assessments
  const isUnlimited = user.subscriptionTier === 'pro' || user.subscriptionTier === 'enterprise';
  const allowed = isUnlimited || user.assessmentsUsed < user.assessmentsLimit;

  return {
    allowed,
    current: user.assessmentsUsed,
    limit: user.assessmentsLimit,
    tier: user.subscriptionTier,
  };
}

/**
 * Check if user can create a new roadmap
 */
export async function checkRoadmapLimit(clerkUserId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: string;
}> {
  const user = await getUserByClerkId(clerkUserId);

  if (!user) {
    return { allowed: false, current: 0, limit: 0, tier: 'none' };
  }

  const allowed = user.roadmapsUsed < user.roadmapsLimit;

  return {
    allowed,
    current: user.roadmapsUsed,
    limit: user.roadmapsLimit,
    tier: user.subscriptionTier,
  };
}

/**
 * Increment assessment usage count
 */
export async function incrementAssessmentUsage(clerkUserId: string): Promise<void> {
  const user = await getUserByClerkId(clerkUserId);
  if (!user) return;

  user.assessmentsUsed += 1;
  const userRepository = AppDataSource.getRepository(UserEntity);
  await userRepository.save(user);
}

/**
 * Increment roadmap usage count
 */
export async function incrementRoadmapUsage(clerkUserId: string): Promise<void> {
  const user = await getUserByClerkId(clerkUserId);
  if (!user) return;

  user.roadmapsUsed += 1;
  const userRepository = AppDataSource.getRepository(UserEntity);
  await userRepository.save(user);
}

/**
 * Check if user has access to a premium feature
 */
export async function canAccessFeature(
  clerkUserId: string,
  feature: 'roadmap_regeneration' | 'ai_coaching' | 'analytics' | 'team_accounts'
): Promise<boolean> {
  const user = await getUserByClerkId(clerkUserId);
  if (!user) return false;

  const { subscriptionTier } = user;

  // Feature access matrix
  const featureAccess: Record<string, string[]> = {
    roadmap_regeneration: ['pro', 'enterprise'],
    ai_coaching: ['pro', 'enterprise'],
    analytics: ['pro', 'enterprise'],
    team_accounts: ['enterprise'],
  };

  return featureAccess[feature]?.includes(subscriptionTier) || false;
}

/**
 * Get subscription tier display name
 */
export function getTierDisplayName(tier: string): string {
  const displayNames: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return displayNames[tier] || 'Unknown';
}

/**
 * Check if subscription is active
 */
export async function isSubscriptionActive(clerkUserId: string): Promise<boolean> {
  const user = await getUserByClerkId(clerkUserId);
  if (!user) return false;

  if (user.subscriptionStatus !== 'active') return false;

  // Check if subscription has expired
  if (user.subscriptionEndsAt && new Date() > user.subscriptionEndsAt) {
    return false;
  }

  return true;
}
