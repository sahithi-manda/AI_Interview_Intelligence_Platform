import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePreparation } from "../hooks/usePreparation";
import Modal from "../components/ui/Modal";

function Settings() {
    const { user, login, logout, token } = useAuth();
    const { profile, updateProfile, targetJob, updateTargetJob } = usePreparation();

    const [name, setName] = useState(user?.name || profile.name);
    const [email, setEmail] = useState(user?.email || profile.email);
    const [targetRole, setTargetRole] = useState(targetJob.jobTitle);
    const [experienceLevel, setExperienceLevel] = useState(targetJob.experience);
    const [defaultInterviewType, setDefaultInterviewType] = useState("Mixed");
    const [defaultDifficulty, setDefaultDifficulty] = useState("Medium");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [interviewReminders, setInterviewReminders] = useState(true);
    const [weeklyProgress, setWeeklyProgress] = useState(true);

    const [saved, setSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const handleSaveProfile = () => {
        if (user && token) {
            login({
                user: {
                    ...user,
                    name,
                    email,
                },
                access_token: token,
            });
        }
        updateProfile({ name, email });
        updateTargetJob({ jobTitle: targetRole, experience: experienceLevel });

        setSaved(true);
        window.setTimeout(() => {
            setSaved(false);
        }, 2500);
    };

    const handleChangePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            setPasswordMessage("Please enter your current and new password.");
            return;
        }
        setPasswordMessage("Password updated successfully!");
        window.setTimeout(() => {
            setShowPasswordModal(false);
            setOldPassword("");
            setNewPassword("");
            setPasswordMessage("");
        }, 1500);
    };

    const handleDeleteAccountConfirm = () => {
        logout();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <p className="text-sm font-medium text-gray-500">ACCOUNT & PREFERENCES</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight">Settings</h1>
                <p className="mt-3 max-w-2xl text-gray-400">
                    Manage your profile, interview preferences, notifications, and account settings.
                </p>
            </section>

            {/* Save notification */}
            {saved && (
                <div className="rounded-xl border border-gray-700 bg-gray-950 px-5 py-4 text-sm text-gray-300">
                    ✓ Your settings have been saved successfully.
                </div>
            )}

            {/* Profile */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">PROFILE</p>
                    <h2 className="mt-2 text-xl font-semibold">Personal information</h2>
                    <p className="mt-2 text-sm text-gray-500">Keep your candidate profile up to date.</p>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black">
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold">{name || "Your Name"}</p>
                                <p className="mt-1 text-sm text-gray-500">Candidate profile</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Enter your name"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-gray-500"
                        />
                    </div>
                </div>

                <div className="mt-7 flex justify-end border-t border-gray-800 pt-6">
                    <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
                    >
                        Save Profile
                    </button>
                </div>
            </section>

            {/* Career preferences */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">CAREER PREFERENCES</p>
                    <h2 className="mt-2 text-xl font-semibold">Your target role</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        These preferences help personalize your interview preparation and recommendations.
                    </p>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <div>
                        <label htmlFor="targetRole" className="mb-2 block text-sm font-medium text-gray-300">
                            Target Role
                        </label>
                        <input
                            id="targetRole"
                            type="text"
                            value={targetRole}
                            onChange={(event) => setTargetRole(event.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="experienceLevel" className="mb-2 block text-sm font-medium text-gray-300">
                            Experience Level
                        </label>
                        <select
                            id="experienceLevel"
                            value={experienceLevel}
                            onChange={(event) => setExperienceLevel(event.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition focus:border-gray-500"
                        >
                            <option>0–2 years</option>
                            <option>2–4 years</option>
                            <option>4–6 years</option>
                            <option>6+ years</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Interview preferences */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">INTERVIEW PREFERENCES</p>
                    <h2 className="mt-2 text-xl font-semibold">Default interview settings</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Choose the defaults used when starting a new practice interview.
                    </p>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                    <div>
                        <label htmlFor="defaultInterviewType" className="mb-2 block text-sm font-medium text-gray-300">
                            Default Interview Type
                        </label>
                        <select
                            id="defaultInterviewType"
                            value={defaultInterviewType}
                            onChange={(event) => setDefaultInterviewType(event.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition focus:border-gray-500"
                        >
                            <option>Mixed</option>
                            <option>Technical</option>
                            <option>Behavioral</option>
                            <option>System Design</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="defaultDifficulty" className="mb-2 block text-sm font-medium text-gray-300">
                            Default Difficulty
                        </label>
                        <select
                            id="defaultDifficulty"
                            value={defaultDifficulty}
                            onChange={(event) => setDefaultDifficulty(event.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none transition focus:border-gray-500"
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">NOTIFICATIONS</p>
                    <h2 className="mt-2 text-xl font-semibold">Notification preferences</h2>
                    <p className="mt-2 text-sm text-gray-500">Choose what updates you'd like to receive.</p>
                </div>

                <div className="mt-7 divide-y divide-gray-800">
                    <div className="flex items-center justify-between gap-5 py-5">
                        <div>
                            <p className="text-sm font-medium">Email notifications</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Receive important account and preparation updates.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEmailNotifications((prev) => !prev)}
                            aria-label="Toggle email notifications"
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                emailNotifications ? "bg-white" : "bg-gray-800"
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full transition ${
                                    emailNotifications ? "left-6 bg-black" : "left-1 bg-gray-500"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-5 py-5">
                        <div>
                            <p className="text-sm font-medium">Interview reminders</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Get reminders to continue your interview practice.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInterviewReminders((prev) => !prev)}
                            aria-label="Toggle interview reminders"
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                interviewReminders ? "bg-white" : "bg-gray-800"
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full transition ${
                                    interviewReminders ? "left-6 bg-black" : "left-1 bg-gray-500"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-5 py-5">
                        <div>
                            <p className="text-sm font-medium">Weekly progress summary</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Receive a summary of your interview performance.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setWeeklyProgress((prev) => !prev)}
                            aria-label="Toggle weekly progress"
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                                weeklyProgress ? "bg-white" : "bg-gray-800"
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full transition ${
                                    weeklyProgress ? "left-6 bg-black" : "left-1 bg-gray-500"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">SECURITY</p>
                    <h2 className="mt-2 text-xl font-semibold">Account security</h2>
                    <p className="mt-2 text-sm text-gray-500">Manage your account security settings.</p>
                </div>

                <div className="mt-7 space-y-3">
                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-800 bg-black p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-medium">Password</p>
                            <p className="mt-1 text-xs text-gray-600">Change your account password.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="w-fit rounded-xl border border-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-800 bg-black p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-medium">Active session</p>
                            <p className="mt-1 text-xs text-gray-600">This browser is currently signed in.</p>
                        </div>
                        <span className="w-fit rounded-full border border-gray-800 px-3 py-1.5 text-xs text-gray-500">
                            Active
                        </span>
                    </div>
                </div>
            </section>

            {/* Danger zone */}
            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
                <p className="text-sm font-medium text-gray-500">ACCOUNT</p>
                <h2 className="mt-2 text-xl font-semibold">Account actions</h2>

                <div className="mt-6 rounded-xl border border-gray-800 bg-black p-5">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-medium">Delete account</p>
                            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                                Permanently remove your account and associated preparation data.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="w-fit rounded-xl border border-red-900 bg-red-950/30 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-700 hover:text-white"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Change Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
            >
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Current Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-gray-500"
                        />
                    </div>
                    {passwordMessage && (
                        <p className="text-xs text-gray-300">{passwordMessage}</p>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="rounded-xl border border-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Account Deletion"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Are you sure you want to delete your account? This action cannot be undone and will erase all interview history and saved data.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="rounded-xl border border-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAccountConfirm}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
                        >
                            Yes, Delete Account
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Settings;