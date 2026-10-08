import SettingsForm from "./components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[22px] font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
          Manage your profile, password, and notification preferences.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}