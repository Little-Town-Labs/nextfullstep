import { getRepository } from "./data-source";
import {
  AuditLogEntity,
  AuditAction,
  AuditSeverity,
} from "@/entities/AuditLogEntity";
import { headers } from "next/headers";

interface CreateAuditLogParams {
  action: AuditAction;
  performedById?: string | null;
  targetUserId?: string | null;
  description: string;
  severity?: AuditSeverity;
  metadata?: Record<string, any>;
  resourceType?: string;
  resourceId?: string;
}

interface AuditLogFilters {
  action?: AuditAction;
  performedById?: string;
  targetUserId?: string;
  severity?: AuditSeverity;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<AuditLogEntity> {
  const repo = await getRepository(AuditLogEntity);

  // Extract IP address and user agent from headers
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;
  const userAgent = headersList.get("user-agent") || null;

  const auditLog = repo.create({
    action: params.action,
    severity: params.severity || AuditSeverity.INFO,
    performedById: params.performedById || null,
    targetUserId: params.targetUserId || null,
    description: params.description,
    metadata: params.metadata || null,
    ipAddress,
    userAgent,
    resourceType: params.resourceType || null,
    resourceId: params.resourceId || null,
  });

  return await repo.save(auditLog);
}

/**
 * Retrieves audit logs with filtering and pagination
 */
export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<{
  logs: AuditLogEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const repo = await getRepository(AuditLogEntity);
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const queryBuilder = repo
    .createQueryBuilder("audit")
    .leftJoinAndSelect("audit.performedBy", "performedBy")
    .leftJoinAndSelect("audit.targetUser", "targetUser");

  // Apply filters
  if (filters.action) {
    queryBuilder.andWhere("audit.action = :action", {
      action: filters.action,
    });
  }

  if (filters.performedById) {
    queryBuilder.andWhere("audit.performedById = :performedById", {
      performedById: filters.performedById,
    });
  }

  if (filters.targetUserId) {
    queryBuilder.andWhere("audit.targetUserId = :targetUserId", {
      targetUserId: filters.targetUserId,
    });
  }

  if (filters.severity) {
    queryBuilder.andWhere("audit.severity = :severity", {
      severity: filters.severity,
    });
  }

  if (filters.resourceType) {
    queryBuilder.andWhere("audit.resourceType = :resourceType", {
      resourceType: filters.resourceType,
    });
  }

  if (filters.resourceId) {
    queryBuilder.andWhere("audit.resourceId = :resourceId", {
      resourceId: filters.resourceId,
    });
  }

  if (filters.startDate) {
    queryBuilder.andWhere("audit.createdAt >= :startDate", {
      startDate: filters.startDate,
    });
  }

  if (filters.endDate) {
    queryBuilder.andWhere("audit.createdAt <= :endDate", {
      endDate: filters.endDate,
    });
  }

  // Get total count
  const total = await queryBuilder.getCount();

  // Get paginated results
  const logs = await queryBuilder
    .orderBy("audit.createdAt", "DESC")
    .skip(skip)
    .take(limit)
    .getMany();

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Gets audit log statistics
 */
export async function getAuditLogStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  topPerformers: Array<{ userId: string; email: string; count: number }>;
  recentCritical: AuditLogEntity[];
}> {
  const repo = await getRepository(AuditLogEntity);

  const queryBuilder = repo.createQueryBuilder("audit");

  if (startDate) {
    queryBuilder.andWhere("audit.createdAt >= :startDate", { startDate });
  }

  if (endDate) {
    queryBuilder.andWhere("audit.createdAt <= :endDate", { endDate });
  }

  const totalLogs = await queryBuilder.getCount();

  // Group by action
  const byActionRaw = await repo
    .createQueryBuilder("audit")
    .select("audit.action", "action")
    .addSelect("COUNT(*)", "count")
    .groupBy("audit.action")
    .getRawMany();

  const byAction = byActionRaw.reduce(
    (acc, row) => {
      acc[row.action] = parseInt(row.count);
      return acc;
    },
    {} as Record<string, number>
  );

  // Group by severity
  const bySeverityRaw = await repo
    .createQueryBuilder("audit")
    .select("audit.severity", "severity")
    .addSelect("COUNT(*)", "count")
    .groupBy("audit.severity")
    .getRawMany();

  const bySeverity = bySeverityRaw.reduce(
    (acc, row) => {
      acc[row.severity] = parseInt(row.count);
      return acc;
    },
    {} as Record<string, number>
  );

  // Top performers (users with most audit log entries)
  const topPerformersRaw = await repo
    .createQueryBuilder("audit")
    .leftJoinAndSelect("audit.performedBy", "user")
    .select("audit.performedById", "userId")
    .addSelect("user.email", "email")
    .addSelect("COUNT(*)", "count")
    .where("audit.performedById IS NOT NULL")
    .groupBy("audit.performedById")
    .addGroupBy("user.email")
    .orderBy("count", "DESC")
    .limit(10)
    .getRawMany();

  const topPerformers = topPerformersRaw.map((row) => ({
    userId: row.userId,
    email: row.email,
    count: parseInt(row.count),
  }));

  // Recent critical events
  const recentCritical = await repo.find({
    where: { severity: AuditSeverity.CRITICAL },
    order: { createdAt: "DESC" },
    take: 10,
    relations: ["performedBy", "targetUser"],
  });

  return {
    totalLogs,
    byAction,
    bySeverity,
    topPerformers,
    recentCritical,
  };
}

/**
 * Helper function to log admin user management actions
 */
export async function logAdminUserAction(params: {
  action: AuditAction;
  adminId: string;
  targetUserId: string;
  description: string;
  metadata?: Record<string, any>;
}): Promise<AuditLogEntity> {
  return createAuditLog({
    action: params.action,
    performedById: params.adminId,
    targetUserId: params.targetUserId,
    description: params.description,
    severity:
      params.action === AuditAction.USER_DELETE
        ? AuditSeverity.WARNING
        : AuditSeverity.INFO,
    metadata: params.metadata,
    resourceType: "user",
    resourceId: params.targetUserId,
  });
}

/**
 * Helper function to log security events
 */
export async function logSecurityEvent(params: {
  action: AuditAction;
  userId?: string;
  description: string;
  severity?: AuditSeverity;
  metadata?: Record<string, any>;
}): Promise<AuditLogEntity> {
  return createAuditLog({
    action: params.action,
    performedById: params.userId || null,
    description: params.description,
    severity: params.severity || AuditSeverity.WARNING,
    metadata: params.metadata,
  });
}
