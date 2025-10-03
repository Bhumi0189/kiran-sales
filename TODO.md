# TODO List for Admin Dashboard Enhancement

- [ ] Add ThemeProvider to app/layout.tsx for theme support using next-themes.
- [ ] Update app/admin/page.tsx:
  - Implement real-time revenue update by fetching dashboard data every 10 seconds.
  - Ensure feedback section shows user email, content, and date.
- [ ] Update app/admin/analytics/page.tsx:
  - Fetch analytics data (customers count, monthly orders, monthly revenue).
  - Implement pie chart using Chart.js and react-chartjs-2.
- [ ] Update app/admin/settings/page.tsx:
  - Add theme toggle (light/dark mode) using next-themes.
  - Add basic settings UI placeholders (profile, notifications toggle, password change).
- [ ] Test all changes in development environment.
- [ ] Verify real-time revenue updates, pie chart rendering, and theme toggle functionality.
