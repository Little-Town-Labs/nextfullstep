import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data-source";
import { UserEntity } from "@/entities/UserEntity";

/**
 * One-time admin setup endpoint
 * Visit: http://localhost:3000/api/setup-admin?email=YOUR_EMAIL
 *
 * SECURITY: Remove this file after first use or add authentication
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          error: "Email parameter required",
          usage: "/api/setup-admin?email=your-email@example.com"
        },
        { status: 400 }
      );
    }

    const userRepo = await getRepository(UserEntity);

    // Find user by email
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      // List all users to help find the right one
      const allUsers = await userRepo.find({
        select: ["id", "email", "name", "isAdmin"]
      });

      return NextResponse.json({
        error: `User not found with email: ${email}`,
        availableUsers: allUsers,
        tip: "Make sure you've signed up first"
      }, { status: 404 });
    }

    // Check if already admin
    if (user.isAdmin) {
      return NextResponse.json({
        message: "User is already an admin",
        user: {
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          role: user.role
        }
      });
    }

    // Promote to admin
    user.isAdmin = true;
    user.role = "admin";
    await userRepo.save(user);

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully!",
      user: {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role,
        clerkUserId: user.clerkUserId
      },
      nextSteps: "You can now access the admin panel at /admin"
    });

  } catch (error) {
    console.error("Error in setup-admin:", error);
    return NextResponse.json(
      {
        error: "Failed to promote user",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
