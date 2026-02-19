/**
 * Permissions Package
 * 
 * Complete permission engine with role hierarchy, caching, and middleware.
 * 
 * @example
 * ```typescript
 * import { PermissionService, createPermissionMiddleware } from '@discord-platform/permissions';
 * 
 * const permissionService = new PermissionService(prisma, redis, superAdminId);
 * 
 * // Check permission
 * const result = await permissionService.hasPermission({
 *   userId: '123',
 *   guildId: '456',
 *   resource: 'moderation',
 *   action: PermissionAction.EXECUTE,
 * });
 * 
 * // Use middleware
 * const requirePerm = createPermissionMiddleware(permissionService);
 * app.get('/api/guilds/:guildId/settings', {
 *   preHandler: requirePerm({
 *     resource: 'guild',
 *     action: PermissionAction.MANAGE,
 *   }),
 * }, handler);
 * ```
 */

export * from './types';
export * from './checker';
export * from './cache';
export * from './service';
export * from './middleware';
