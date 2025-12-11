# CurioED Database Setup Guide

## Overview

This guide walks you through setting up the complete CurioED v1.0 database schema in your Supabase project.

## Prerequisites

- Supabase account at https://supabase.com
- Project URL: `https://xuvtdnvpuqrwvatwikzx.supabase.co`
- Access to SQL Editor in Supabase dashboard

---

## Step 1: Run the Complete Schema Migration

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard/project/xuvtdnvpuqrwvatwikzx/sql
   - Click "New Query"

2. **Copy and paste** the contents of `/supabase/migrations/002_complete_schema.sql`

3. **Click "Run"** to execute the migration

4. **Verify** tables were created:
   - Go to Table Editor
   - You should see these new tables:
     - `curioed_students`
     - `curioed_educators`
     - `curioed_projects`
     - `curioed_badges`
     - `curioed_student_badges`
     - `curioed_activity_log`
     - `curioed_goal_updates`

---

## Step 2: Seed Initial Badges

1. **Open a new query** in SQL Editor

2. **Copy and paste** the contents of `/supabase/seed/001_badges.sql`

3. **Click "Run"**

4. **Verify** badges were created:
   ```sql
   SELECT code, name, category FROM curioed_badges ORDER BY category, points;
   ```
   - Should return 24 badges across 5 categories

---

## Step 3: Enable Authentication

1. **Go to Authentication** → **Providers**

2. **Enable Email Provider**
   - Already enabled in your project ✓

3. **Configure Email Templates** (optional for pilot)
   - Go to Authentication → Email Templates
   - Customize signup confirmation email

4. **Set URL Configuration**
   - Go to Authentication → URL Configuration
   - Add redirect URL: `http://localhost:5173/**` (for development)
   - Add redirect URL: `https://curioed.vercel.app/**` (for production)

---

## Step 4: Verify Row Level Security

Run this query to confirm RLS is enabled:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename LIKE 'curioed_%'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

---

## Database Schema Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `curioed_students` | Student profiles | first_name, last_name, grade |
| `curioed_educators` | Educator profiles | first_name, last_name, school |
| `curioed_goals` | Student goals | title, progress, completed |
| `curioed_reflections` | Weekly reflections | content, week_of, craft_element |
| `curioed_projects` | Student projects | title, status, project_type |
| `curioed_badges` | Badge definitions | code, name, criteria |
| `curioed_student_badges` | Earned badges | user_id, badge_id |
| `curioed_assignments` | Educator-Student links | educator_id, student_id |
| `curioed_activity_log` | User activity tracking | activity_type, occurred_at |
| `curioed_goal_updates` | Goal progress history | goal_id, progress, note |

### Data Flow

```
auth.users (Supabase Auth)
    ↓
    ├─→ curioed_students (role: student)
    │       ↓
    │       ├─→ curioed_goals
    │       ├─→ curioed_reflections
    │       ├─→ curioed_projects
    │       └─→ curioed_student_badges
    │
    └─→ curioed_educators (role: educator)
            ↓
            └─→ curioed_assignments → links to students
```

---

## Testing the Schema

### Create a Test Student

```sql
-- 1. Create user in auth.users (use Supabase Dashboard → Authentication → Users → Add User)
-- Email: test@student.com, Password: TestPass123!

-- 2. Get the user_id from auth.users
SELECT id FROM auth.users WHERE email = 'test@student.com';

-- 3. Create student profile (replace USER_ID)
INSERT INTO curioed_students (user_id, first_name, last_name, grade)
VALUES ('USER_ID', 'Test', 'Student', 10);

-- 4. Create a test goal
INSERT INTO curioed_goals (user_id, title, category)
VALUES ('USER_ID', 'Complete math homework', 'academic');

-- 5. Create a test reflection
INSERT INTO curioed_reflections (user_id, content, week_of, craft_element)
VALUES ('USER_ID', 'Today I learned about variables in Python', CURRENT_DATE, 'curiosity');
```

### Create a Test Educator

```sql
-- 1. Create user in Supabase Dashboard
-- Email: test@educator.com, Password: EduPass123!

-- 2. Get the user_id
SELECT id FROM auth.users WHERE email = 'test@educator.com';

-- 3. Create educator profile (replace USER_ID)
INSERT INTO curioed_educators (user_id, first_name, last_name, school)
VALUES ('USER_ID', 'Test', 'Educator', 'Newark Pilot School');

-- 4. Assign educator to student (replace IDs)
INSERT INTO curioed_assignments (educator_id, student_id)
VALUES ('EDUCATOR_USER_ID', 'STUDENT_USER_ID');
```

---

## Useful Queries for Development

### View all students with their activity
```sql
SELECT 
  s.first_name || ' ' || s.last_name as name,
  s.grade,
  COUNT(DISTINCT g.id) as goals,
  COUNT(DISTINCT r.id) as reflections,
  COUNT(DISTINCT p.id) as projects,
  MAX(al.occurred_at) as last_activity
FROM curioed_students s
LEFT JOIN curioed_goals g ON g.user_id = s.user_id
LEFT JOIN curioed_reflections r ON r.user_id = s.user_id
LEFT JOIN curioed_projects p ON p.user_id = s.user_id
LEFT JOIN curioed_activity_log al ON al.user_id = s.user_id
GROUP BY s.id, s.first_name, s.last_name, s.grade;
```

### View educator's assigned students
```sql
SELECT 
  e.first_name || ' ' || e.last_name as educator,
  s.first_name || ' ' || s.last_name as student,
  s.grade
FROM curioed_educators e
JOIN curioed_assignments a ON a.educator_id = e.user_id
JOIN curioed_students s ON s.user_id = a.student_id
ORDER BY e.last_name, s.grade, s.last_name;
```

### Check badge progress for a student
```sql
-- Replace USER_ID with actual user_id
SELECT 
  b.name,
  b.category,
  b.points,
  CASE WHEN sb.id IS NOT NULL THEN 'Earned' ELSE 'Not Earned' END as status,
  sb.earned_at
FROM curioed_badges b
LEFT JOIN curioed_student_badges sb ON sb.badge_id = b.id AND sb.user_id = 'USER_ID'
ORDER BY b.category, b.points;
```

---

## Troubleshooting

### Issue: "permission denied for table curioed_goals"
**Solution:** RLS is blocking your query. Either:
- Query as an authenticated user (via Supabase client in app)
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE curioed_goals DISABLE ROW LEVEL SECURITY;
  ```
  (Re-enable before production!)

### Issue: "relation 'curioed_students' does not exist"
**Solution:** Run the migration again. The table creation failed.

### Issue: Badge criteria not triggering
**Solution:** Badges require custom logic in the application. The `criteria` field is metadata for the app to read, not automatic SQL triggers.

---

## Next Steps

After completing database setup:

1. ✅ Database schema is ready
2. → **Next:** Set up authentication in React app (`feat/authentication-system` branch)
3. → **Then:** Build student dashboard components
4. → **Then:** Build educator dashboard
5. → **Finally:** Deploy to Vercel

---

## Production Checklist

Before launching to Newark pilot:

- [ ] All RLS policies enabled and tested
- [ ] Test data removed from database
- [ ] Backup configured (Supabase does this automatically)
- [ ] Monitoring enabled (Supabase Dashboard → Logs)
- [ ] Email templates customized with STEAM for ME branding
- [ ] Production redirect URLs added to auth config
- [ ] API keys secured in `.env` (never committed to git)

---

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Test RLS policies in SQL Editor using `auth.uid()` function
3. Review error messages in browser console
4. Contact: [Your support channel]

**Database is now ready for application development!** 🚀
