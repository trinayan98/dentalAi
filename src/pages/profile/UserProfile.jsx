import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Bell,
  LogOut,
  Trash,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { motion } from "framer-motion";

export default function UserProfile() {
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(
    user?.avatar ||
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  );
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    blogUpdates: true,
    newFeatures: true,
    tips: false,
  });

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    wordpress: false,
    google: true,
    facebook: false,
  });

  const handleProfileUpdate = () => {
    addToast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully",
      type: "success",
    });
  };

  const handlePasswordChange = () => {
    if (!currentPassword) {
      addToast({
        title: "Current password required",
        description: "Please enter your current password",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: "Passwords do not match",
        description: "New password and confirmation must match",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 8) {
      addToast({
        title: "Password too short",
        description: "New password must be at least 8 characters long",
        type: "error",
      });
      return;
    }

    addToast({
      title: "Password updated",
      description: "Your password has been changed successfully",
      type: "success",
    });

    // Reset password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleNotification = (key) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    });
  };

  const handleConnect = (account) => {
    if (connectedAccounts[account]) {
      if (
        window.confirm(
          `Are you sure you want to disconnect your ${account} account?`
        )
      ) {
        setConnectedAccounts({
          ...connectedAccounts,
          [account]: false,
        });

        addToast({
          title: "Account disconnected",
          description: `Your ${account} account has been disconnected`,
          type: "success",
        });
      }
    } else {
      // Simulate connection
      setConnectedAccounts({
        ...connectedAccounts,
        [account]: true,
      });

      addToast({
        title: "Account connected",
        description: `Your ${account} account has been connected successfully`,
        type: "success",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      addToast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
        type: "success",
      });
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <Link to="/dashboard/profile" className="text-gray-500 ">
          Profile
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="px-3 py-3">
            <CardHeader className="border-0">
              <CardTitle className="font-bold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm"
                    />
                    <button
                      className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-sm hover:bg-primary-600 transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 400x400px JPG, PNG
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="h-4 w-4 text-gray-400" />}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                  />

                  <Button
                    variant="primary"
                    onClick={handleProfileUpdate}
                    size="sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="px-3 py-3">
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  />

                  <Button
                    variant="primary"
                    onClick={handlePasswordChange}
                    size="sm"
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-full px-3 py-3">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive email notifications
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleNotification("emailNotifications")
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        notificationPreferences.emailNotifications
                          ? "bg-primary-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          notificationPreferences.emailNotifications
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Blog Updates
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified about blog generation status
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleNotification("blogUpdates")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        notificationPreferences.blogUpdates
                          ? "bg-primary-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          notificationPreferences.blogUpdates
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        New Features
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Learn about new features and updates
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleNotification("newFeatures")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        notificationPreferences.newFeatures
                          ? "bg-primary-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          notificationPreferences.newFeatures
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Tips & Tutorials
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive tips for better blog creation
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleNotification("tips")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        notificationPreferences.tips
                          ? "bg-primary-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`${
                          notificationPreferences.tips
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToast({
                      title: "Notification preferences saved",
                      type: "success",
                    });
                  }}
                  leftIcon={<Bell className="h-4 w-4" />}
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="h-full px-3 py-3">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                        <img
                          src="https://www.svgrepo.com/show/475696/wordpress-color.svg"
                          alt="WordPress"
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          WordPress
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {connectedAccounts.wordpress
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        connectedAccounts.wordpress ? "outline" : "primary"
                      }
                      size="sm"
                      onClick={() => handleConnect("wordpress")}
                    >
                      {connectedAccounts.wordpress ? "Disconnect" : "Connect"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          alt="Google"
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Google
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {connectedAccounts.google
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={connectedAccounts.google ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleConnect("google")}
                    >
                      {connectedAccounts.google ? "Disconnect" : "Connect"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                        <img
                          src="https://www.svgrepo.com/show/452196/facebook-1.svg"
                          alt="Facebook"
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Facebook
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {connectedAccounts.facebook
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        connectedAccounts.facebook ? "outline" : "primary"
                      }
                      size="sm"
                      onClick={() => handleConnect("facebook")}
                    >
                      {connectedAccounts.facebook ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToast({
                      title: "Add your WordPress site",
                      description:
                        "Connect your WordPress site to publish blog posts directly",
                      type: "info",
                    });
                  }}
                  leftIcon={<LinkIcon className="h-4 w-4" />}
                >
                  Connect More Services
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="px-3 py-3">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Log out of your account
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You'll need to enter your credentials to log back in
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      size="sm"
                      leftIcon={<LogOut className="h-4 w-4" />}
                    >
                      Log Out
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
                    <div>
                      <h4 className="text-sm font-medium text-error-900 dark:text-error-200">
                        Delete account
                      </h4>
                      <p className="text-xs text-error-700 dark:text-error-300">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-error-300 dark:border-error-700 text-error-700 dark:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/30"
                      onClick={handleDeleteAccount}
                      leftIcon={<Trash className="h-4 w-4" />}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Hidden as internal utility component
const Edit2 = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
};
