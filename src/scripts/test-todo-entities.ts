/**
 * Test script to validate UserTodo entities
 * Run this to verify database schema creation and entity functionality
 *
 * Usage: npx tsx src/scripts/test-todo-entities.ts
 */

import "reflect-metadata";
import { AppDataSource, initializeDatabase } from "@/lib/data-source";
import { UserTodoEntity } from "@/entities/UserTodoEntity";
import { TodoReminderEntity } from "@/entities/TodoReminderEntity";

async function testTodoEntities() {
  console.log("🚀 Starting Todo Entity Tests...\n");

  // Generate unique test user ID to avoid collisions
  const testUserId = `test_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`🔑 Using test user ID: ${testUserId}\n`);

  try {
    // Initialize database connection
    console.log("📦 Initializing database connection...");
    await initializeDatabase();
    console.log("✅ Database connected successfully\n");

    // Get repositories
    const todoRepo = AppDataSource.getRepository(UserTodoEntity);
    const reminderRepo = AppDataSource.getRepository(TodoReminderEntity);

    // Test 1: Verify tables exist
    console.log("🔍 Test 1: Checking if tables exist...");
    const todoCount = await todoRepo.count();
    const reminderCount = await reminderRepo.count();
    console.log(`   user_todos table exists with ${todoCount} records`);
    console.log(`   todo_reminders table exists with ${reminderCount} records`);
    console.log("✅ Tables verified\n");

    // Test 2: Create a test todo (with unique user ID)
    console.log("🔍 Test 2: Creating test todo...");
    const testTodo = todoRepo.create({
      userId: testUserId,
      title: "Test Todo: Learn TypeScript Generics",
      description: "Complete advanced TypeScript tutorial",
      category: "personal_upskilling",
      priority: "high",
      status: "pending",
      source: "user_created",
      estimatedMinutes: 120,
      tags: JSON.stringify(["typescript", "learning", "programming"]),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    const savedTodo = await todoRepo.save(testTodo);
    console.log(`   ✅ Todo created with ID: ${savedTodo.id}`);
    console.log(`   Title: ${savedTodo.title}`);
    console.log(`   Category: ${savedTodo.category}`);
    console.log(`   Priority: ${savedTodo.priority}\n`);

    // Test 3: Create a test reminder
    console.log("🔍 Test 3: Creating test reminder...");
    const testReminder = reminderRepo.create({
      todoId: savedTodo.id,
      userId: testUserId,
      reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      frequency: "once",
      method: "email",
      status: "pending",
      customMessage: "Don't forget to learn TypeScript generics!",
    });

    const savedReminder = await reminderRepo.save(testReminder);
    console.log(`   ✅ Reminder created with ID: ${savedReminder.id}`);
    console.log(`   For todo: ${savedReminder.todoId}`);
    console.log(`   Method: ${savedReminder.method}\n`);

    // Test 4: Query todos with filters
    console.log("🔍 Test 4: Testing queries...");
    const pendingTodos = await todoRepo.find({
      where: { status: "pending", userId: testUserId },
      order: { createdAt: "DESC" },
    });
    console.log(`   Found ${pendingTodos.length} pending todos\n`);

    // Test 5: Update todo status
    console.log("🔍 Test 5: Updating todo status...");
    savedTodo.status = "completed";
    savedTodo.completedAt = new Date();
    await todoRepo.save(savedTodo);
    console.log(`   ✅ Todo marked as completed\n`);

    // Test 6: Test linked roadmap functionality
    console.log("🔍 Test 6: Testing roadmap linking...");
    const linkedTodo = todoRepo.create({
      userId: testUserId,
      title: "Test Linked Todo",
      category: "personal_upskilling", // Changed from roadmap_derived
      priority: "normal",
      status: "pending",
      source: "roadmap_derived",
      linkedToRoadmapId: "dummy_roadmap_id",
      linkedToTaskId: "dummy_task_id",
    });

    const savedLinkedTodo = await todoRepo.save(linkedTodo);
    console.log(`   ✅ Linked todo created with ID: ${savedLinkedTodo.id}`);
    console.log(`   Linked to roadmap: ${savedLinkedTodo.linkedToRoadmapId}`);
    console.log(`   Linked to task: ${savedLinkedTodo.linkedToTaskId}\n`);

    // Test 7: Clean up test data
    console.log("🧹 Test 7: Cleaning up test data...");
    await todoRepo.remove([savedTodo, savedLinkedTodo]);
    await reminderRepo.remove(savedReminder);
    console.log("   ✅ Test data removed\n");

    console.log("🎉 All tests passed successfully!");
    console.log("\n📊 Summary:");
    console.log("   ✅ Database connection");
    console.log("   ✅ Table creation");
    console.log("   ✅ Todo CRUD operations");
    console.log("   ✅ Reminder CRUD operations");
    console.log("   ✅ Query filtering");
    console.log("   ✅ Status updates");
    console.log("   ✅ Roadmap linking");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n📦 Database connection closed");
    }
  }
}

// Run the tests
testTodoEntities()
  .then(() => {
    console.log("\n✨ Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test script failed:", error);
    process.exit(1);
  });
