import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";

/**
 * POST /api/onboarding - Complete user onboarding
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { selectedGoal } = await req.json();

    // Database is already initialized in middleware at startup
    const userRepository = AppDataSource.getRepository(UserEntity);

    // Find user by Clerk ID
    const user = await userRepository.findOne({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Update user with onboarding data
    user.onboardingCompleted = true;

    // Save the selected goal as the user's selected role
    if (selectedGoal && selectedGoal !== "exploring") {
      user.selectedRoleId = selectedGoal;
    }

    await userRepository.save(user);

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: user.id,
        onboardingCompleted: user.onboardingCompleted,
        selectedRoleId: user.selectedRoleId,
      },
    });
  } catch (error: any) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }}
