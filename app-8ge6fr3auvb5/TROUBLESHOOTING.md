# Troubleshooting Guide

## Blank Screen After Login/Sign Up

If you're experiencing a blank screen after attempting to sign in or sign up, follow these steps:

### 1. Check Browser Console

Open your browser's developer console (F12 or Right-click → Inspect → Console tab) and look for log messages:

**Expected log messages:**
```
[LoginPage] Starting authentication: { mode: 'signin', email: 'user@example.com' }
[LoginPage] Attempting sign in...
[LoginPage] Authentication result: { hasError: false }
[LoginPage] Authentication successful, navigating to: /
[AuthContext] Auth state changed: SIGNED_IN user@example.com
[AuthContext] Profile fetch attempt 1: username
[RouteGuard] State: { loading: false, hasUser: true, path: '/' }
```

**Look for errors:**
- Red error messages indicating network issues
- Authentication errors from Supabase
- Profile loading failures
- Navigation errors

### 2. Verify Supabase Configuration

Check that your `.env` file has the correct Supabase credentials:

```bash
cat .env
```

You should see:
```
VITE_APP_ID=app-8ge6fr3auvb5
VITE_SUPABASE_URL=https://miletymtpsnwtehcxjth.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Check Database Tables

Verify that all required tables exist in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Confirm these tables exist:
   - `profiles`
   - `habits`
   - `habit_completions`
   - `achievements`
   - `user_achievements`
   - `challenges`
   - `challenge_participants`
   - `reminders`
   - `user_stats`

### 4. Verify Database Trigger

The `handle_new_user()` trigger should automatically create a profile when a user signs up.

Check if the trigger exists:
1. Go to Supabase Dashboard → Database → Functions
2. Look for `handle_new_user` function
3. Go to Database → Triggers
4. Look for `on_auth_user_created` trigger on `auth.users` table

### 5. Test Profile Creation Manually

If the trigger isn't working, you can manually create a profile:

1. Sign up with an email
2. Go to Supabase Dashboard → Authentication → Users
3. Copy the user's UUID
4. Go to Table Editor → profiles
5. Click "Insert row" and add:
   - `id`: (paste the UUID)
   - `username`: (any username)
   - `email`: (the user's email)
   - `role`: `user` (or `admin` for first user)

### 6. Clear Browser Cache and Cookies

Sometimes stale authentication data can cause issues:

1. Open browser settings
2. Clear browsing data
3. Select "Cookies and other site data" and "Cached images and files"
4. Clear data for the last hour
5. Refresh the page and try logging in again

### 7. Check Network Tab

Open the Network tab in developer tools:

1. Try to sign in
2. Look for failed requests (red status codes)
3. Check if Supabase API calls are succeeding
4. Look for 401 (Unauthorized) or 403 (Forbidden) errors

### 8. Restart Development Server

Sometimes the development server needs a restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 9. Common Issues and Solutions

#### Issue: "Invalid login credentials"
**Solution:** 
- For sign in: Make sure you're using the correct email and password
- For sign up: Check if the email is already registered

#### Issue: Profile not loading
**Solution:**
- Check browser console for profile fetch errors
- Verify the database trigger is working
- Manually create the profile (see step 5)

#### Issue: Infinite loading spinner
**Solution:**
- Check if `loading` state is stuck at `true`
- Look for JavaScript errors in console
- Verify RouteGuard is receiving user state correctly

#### Issue: Redirecting back to login immediately
**Solution:**
- Check if authentication token is being saved
- Verify Supabase session is persisting
- Check browser's local storage for auth tokens

### 10. Enable Debug Mode

The application now includes detailed console logging. To see all debug messages:

1. Open browser console (F12)
2. Make sure "Verbose" or "All levels" is selected in the console filter
3. Try logging in again
4. Review all `[AuthContext]`, `[RouteGuard]`, and `[LoginPage]` messages

### 11. Test with Different Browsers

Try logging in with a different browser to rule out browser-specific issues:
- Chrome/Edge
- Firefox
- Safari

### 12. Contact Support

If none of the above solutions work, please provide:
- Browser console logs (copy all messages)
- Network tab screenshot showing failed requests
- Steps to reproduce the issue
- Browser and OS version

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Troubleshooting Authentication](https://supabase.com/docs/guides/auth/debugging)
