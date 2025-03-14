// app/category-management/page.tsx
import ProfilePage from '@/components/AdminManagement'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 mt-10 md:mt-0">Settings</h1>
      <ProfilePage />
    </div>
  )
}