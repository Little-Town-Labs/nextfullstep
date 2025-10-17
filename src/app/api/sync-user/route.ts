import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";

/**
 * Sync current Clerk user to database
 * Visit: http://localhost:3000/api/sync-user (while logged in)
 *
 * This endpoint syncs the currently logged-in Clerk user to the database
 * Useful when webhooks haven't been set up or missed the initial user creation
 */
export async function GET() {
  try {
    // Get the current authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          tip: "Please sign in to Clerk first, then visit this endpoint"
        },
        { status: 401 }
      );
    }

    // Get full user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Could not fetch user from Clerk" },
        { status: 404 }
      );
    }

    // Get database repository
    const userRepo = await getRepository(UserEntity);

    // Check if user already exists
    let user = await userRepo.findOne({ where: { clerkUserId: userId } });

    if (user) {
      return NextResponse.json({
        message: "User already exists in database",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          role: user.role,
          clerkUserId: user.clerkUserId
        },
        tip: "Use /api/setup-admin?email=" + user.email + " to promote to admin"
      });
    }

    // Create new user record
    const newUser = new UserEntity();
    newUser.clerkUserId = userId;
    newUser.email = clerkUser.emailAddresses[0]?.emailAddress || '';
    newUser.name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined;
    newUser.profileImageUrl = clerkUser.imageUrl || undefined;
    newUser.subscriptionTier = 'free';
    newUser.subscriptionStatus = 'active';
    newUser.assessmentsUsed = 0;
    newUser.assessmentsLimit = 1;
    newUser.roadmapsUsed = 0;
    newUser.roadmapsLimit = 1;
    newUser.onboardingCompleted = false;
    newUser.status = 'active';
    newUser.usageResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await userRepo.save(newUser);

    return NextResponse.json({
      success: true,
      message: "User synced successfully!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        role: newUser.role,
        clerkUserId: newUser.clerkUserId
      },
      nextSteps: [
        "User created in database",
        "To promote to admin, visit: /api/setup-admin?email=" + newUser.email
      ]
    });

  } catch (error) {
    console.error("Error in sync-user:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
