const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

const filesToCreate = [
  // Auth
  { path: '(auth)/layout.tsx', content: 'export default function AuthLayout({ children }: { children: React.ReactNode }) { return <div className="auth-layout min-h-screen flex items-center justify-center bg-gray-50">{children}</div>; }' },
  { path: '(auth)/login/page.tsx', content: 'export default function LoginPage() { return <div><h1>Login</h1><p>Admin, Leader, Intern Login Form here.</p></div>; }' },

  // Onboarding
  { path: '(onboarding)/layout.tsx', content: 'export default function OnboardingLayout({ children }: { children: React.ReactNode }) { return <div className="onboarding-layout min-h-screen flex flex-col items-center justify-center bg-blue-50">{children}</div>; }' },
  { path: '(onboarding)/onboarding/[token]/page.tsx', content: 'export default function PoliciesPage() { return <div><h1>Onboarding Policies</h1><p>Please read and agree to our policies.</p><a href="form">Agree & Continue</a></div>; }' },
  { path: '(onboarding)/onboarding/[token]/form/page.tsx', content: 'export default function InformationFormPage() { return <div><h1>Information Form</h1><p>Fill out your details.</p><a href="success">Submit</a></div>; }' },
  { path: '(onboarding)/onboarding/[token]/success/page.tsx', content: 'export default function SuccessPage() { return <div><h1>Success!</h1><p>Your information has been submitted.</p></div>; }' },

  // Dashboard Shared Layout
  { path: '(dashboard)/layout.tsx', content: 'export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <div className="dashboard-layout flex min-h-screen"><aside className="w-64 bg-gray-900 text-white p-4">Shared Sidebar (Admin/Leader/Intern)</aside><main className="flex-1 p-8 bg-gray-100">{children}</main></div>; }' },

  // Admin Dashboard
  { path: '(dashboard)/admin/page.tsx', content: 'export default function AdminOverview() { return <div><h1>Admin Dashboard</h1><p>Overview statistics.</p></div>; }' },
  { path: '(dashboard)/admin/leaders/page.tsx', content: 'export default function ManageLeaders() { return <div><h1>Manage Leaders</h1><p>Create and edit Leader accounts.</p></div>; }' },
  { path: '(dashboard)/admin/interns/page.tsx', content: 'export default function ManageInterns() { return <div><h1>Manage Interns (Admin)</h1><p>Create and edit Intern accounts.</p></div>; }' },

  // Leader Dashboard
  { path: '(dashboard)/leader/page.tsx', content: 'export default function LeaderOverview() { return <div><h1>Leader Dashboard</h1><p>Overview of my team.</p></div>; }' },
  { path: '(dashboard)/leader/interns/page.tsx', content: 'export default function LeaderManageInterns() { return <div><h1>My Interns</h1><p>Manage tasks and evaluations for assigned interns.</p></div>; }' },

  // Intern Dashboard
  { path: '(dashboard)/intern/page.tsx', content: 'export default function InternOverview() { return <div><h1>Intern Dashboard</h1><p>My progress and overview.</p></div>; }' },
  { path: '(dashboard)/intern/tasks/page.tsx', content: 'export default function InternTasks() { return <div><h1>My Tasks</h1><p>View tasks and submit reports.</p></div>; }' }
];

filesToCreate.forEach(file => {
  const fullPath = path.join(appDir, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, file.content, 'utf8');
    console.log(`Created ${file.path}`);
  } else {
    console.log(`Skipped ${file.path} (already exists)`);
  }
});
