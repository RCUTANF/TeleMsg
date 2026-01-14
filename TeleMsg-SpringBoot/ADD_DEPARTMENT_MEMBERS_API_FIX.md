# 添加部门成员 API 端点修复

## 问题描述
前端调用 `POST /api/admin/departments/{departmentId}/members` 接口添加部门成员时，返回 405 错误：
```
Method 'POST' is not supported
```

## 问题原因
后端 `AdminController` 中缺少批量添加部门成员的 POST 端点，导致前端请求失败。

## 解决方案

### 1. 更新 DepartmentService
虽然 `DepartmentService` 中已经有 `addDepartmentMembers` 方法，但需��确保其实现正确。

**文件**: `TeleMsg-SpringBoot/src/main/java/com/telemsg/server/service/DepartmentService.java`

该方法功能：
- 验证部门是否存在
- 批量更新用户的部门ID
- 记录操作日志

```java
@Transactional
public void addDepartmentMembers(String departmentId, List<String> userIds) {
    // 验证部门是否存在
    Optional<Department> departmentOpt = departmentRepository.findByDepartmentId(departmentId);
    if (departmentOpt.isEmpty()) {
        throw new RuntimeException("部门不存在");
    }

    // 批量更新用户的部门ID
    for (String userId : userIds) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setDepartmentId(departmentId);
            userRepository.save(user);
        } else {
            log.warn("用户不存在，跳过添加: userId={}", userId);
        }
    }

    log.info("批量添加部门成员成功: departmentId={}, count={}", departmentId, userIds.size());
}
```

### 2. 添加 AdminController 端点

**文件**: `TeleMsg-SpringBoot/src/main/java/com/telemsg/server/controller/AdminController.java`

#### 新增端点

##### (1) POST /admin/departments/{departmentId}/members
批量添加部门成员

**请求体**:
```json
{
  "userIds": ["userId1", "userId2", ...]
}
```

**响应**:
```json
{
  "message": "成功添加 2 名成员"
}
```

**实现代码**:
```java
@PostMapping("/departments/{departmentId}/members")
public ResponseEntity<?> addDepartmentMembers(
    @RequestHeader("Authorization") String authHeader,
    @PathVariable String departmentId,
    @RequestBody @Validated AddDepartmentMembersRequest request
) {
    try {
        extractUserAndCheckAdmin(authHeader);
        
        departmentService.addDepartmentMembers(departmentId, request.getUserIds());
        
        return ResponseEntity.ok(Map.of(
            "message", "成功添加 " + request.getUserIds().size() + " 名成员"
        ));
    } catch (Exception e) {
        log.error("添加部门成员失败", e);
        return ResponseEntity.badRequest().body(Map.of(
            "error", "添加部门成员失败: " + e.getMessage()
        ));
    }
}
```

##### (2) DELETE /admin/departments/{departmentId}/members/{userId}
移除单个部门成员

**响应**:
```json
{
  "message": "成功移除成员"
}
```

**实现代码**:
```java
@DeleteMapping("/departments/{departmentId}/members/{userId}")
public ResponseEntity<?> removeDepartmentMember(
    @RequestHeader("Authorization") String authHeader,
    @PathVariable String departmentId,
    @PathVariable String userId
) {
    try {
        extractUserAndCheckAdmin(authHeader);
        
        departmentService.removeDepartmentMember(departmentId, userId);
        
        return ResponseEntity.ok(Map.of("message", "成功移除成员"));
    } catch (Exception e) {
        log.error("移除部门成员失败", e);
        return ResponseEntity.badRequest().body(Map.of(
            "error", "移除部门成员失败: " + e.getMessage()
        ));
    }
}
```

#### 新增请求对象类

```java
public static class AddDepartmentMembersRequest {
    private List<String> userIds;
    
    public List<String> getUserIds() { return userIds; }
    public void setUserIds(List<String> userIds) { this.userIds = userIds; }
}
```

## API 完整列表

现在部门成员管理相关的 API 端点包括：

| 方法 | 端点 | 功能 | 请求体 |
|------|------|------|--------|
| GET | `/admin/departments/{id}/members` | 获取部门成员列表 | - |
| POST | `/admin/departments/{id}/members` | 批量添加部门成员 | `{ "userIds": [...] }` |
| DELETE | `/admin/departments/{id}/members/{userId}` | 移除单个部门成员 | - |

## 前后端对接

### 前端调用方式 (已实现)
`ui/src/app/services/api.ts`:

```typescript
async addDepartmentMembers(departmentId: string, userIds: string[]): Promise<void> {
  await this.request(`/admin/departments/${departmentId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
}
```

### 后端响应格式
成功：
```json
{
  "message": "成功添加 3 名成员"
}
```

失败：
```json
{
  "error": "添加部门成员失败: 部门不存在"
}
```

## 权限验证
所有端点都通过 `extractUserAndCheckAdmin()` 验证：
1. JWT Token 有效性
2. 用户是否为管理员 (`isAdmin = true`)

## 事务处理
- `addDepartmentMembers` 使用 `@Transactional` 注解
- 确保批量操作的原子性
- 任何失败都会回滚整个事务

## 错误处理
1. **部门不存在**: 抛出 `RuntimeException("部门不存在")`
2. **用户不存在**: 记录警告日志，跳过该用户
3. **权限不足**: 抛出 `RuntimeException("需要管理员权限")`
4. **Token 无效**: 抛出 `RuntimeException("无效的认证token")`

## 测试建议

### 1. 成功场景
```bash
POST /api/admin/departments/D1768376828400823/members
Authorization: Bearer {valid_admin_token}
Content-Type: application/json

{
  "userIds": ["user1", "user2", "user3"]
}
```

### 2. 部门不存在
```bash
POST /api/admin/departments/INVALID_ID/members
```

### 3. 权限不足
使用非管理员用户的 Token

### 4. 移除成员
```bash
DELETE /api/admin/departments/D1768376828400823/members/user1
Authorization: Bearer {valid_admin_token}
```

## 更新文件清单

1. ✅ `TeleMsg-SpringBoot/src/main/java/com/telemsg/server/service/DepartmentService.java`
   - 确保 `addDepartmentMembers()` 方法存在
   - 添加 `removeDepartmentMember()` 方法

2. ✅ `TeleMsg-SpringBoot/src/main/java/com/telemsg/server/controller/AdminController.java`
   - 添加 `POST /departments/{id}/members` 端点
   - 添加 `DELETE /departments/{id}/members/{userId}` 端点
   - 添加 `AddDepartmentMembersRequest` 请求对象

## 更新日期
2026-01-14

