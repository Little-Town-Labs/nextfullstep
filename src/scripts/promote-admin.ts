import "reflect-metadata";
import { initializeDatabase, getRepository } from "../lib/data-source";
import { UserEntity } from "../entities/UserEntity";

/**
 * Promote User to Admin
 *
 * Promotes a user to admin by their email address
 * Run with: npx tsx src/scripts/promote-admin.ts <email>
 *
 * Example: npx tsx src/scripts/promote-admin.ts admin@example.com
 */

async function promoteToAdmin(email: string) {
  console.log(`🔐 Promoting user to admin: ${email}`);

  try {
    // Initialize database
    await initializeDatabase();
    console.log("✅ Database initialized");

    const userRepo = await getRepository(UserEntity);

    // Find user by email
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log("\n💡 Tip: Make sure the user has signed up first.");
      process.exit(1);
    }

    // Check if already admin
    if (user.isAdmin) {
      console.log(`⚠️  User is already an admin: ${user.name || user.email}`);
      process.exit(0);
    }

    // Promote to admin
    user.isAdmin = true;
    user.role = "admin";
    await userRepo.save(user);

    console.log("\n🎉 User promoted to admin successfully!");
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name || "(not set)"}`);
    console.log(`🆔 User ID: ${user.id}`);
    console.log(`🔑 Clerk ID: ${user.clerkUserId}`);
    console.log(`\n✅ The user can now access the admin panel at /admin`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Error: Email address required");
  console.log("\nUsage: npx tsx src/scripts/promote-admin.ts <email>");
  console.log("Example: npx tsx src/scripts/promote-admin.ts admin@example.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Error: Invalid email format: ${email}`);
  process.exit(1);
}

// Run the promote function
promoteToAdmin(email);
