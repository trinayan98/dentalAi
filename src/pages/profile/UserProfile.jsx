import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  Bell,
  LogOut,
  Trash,
  ChevronRight,
  Link as LinkIcon,
  AtSign,
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
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { motion } from "framer-motion";
import { userApi } from "../../utils/api";
import imageCompression from "browser-image-compression";
import ImageCropper from "../../components/ImageCropper";

const IMAGE_CONSTANTS = {
  VALID_TYPES: ["image/jpeg", "image/png", "image/gif"],
  MAX_SIZE: 5 * 1024 * 1024,
  DEFAULT_AVATAR: "/default-avatar.png",
};

export default function UserProfile() {
  const { id: userId } = useParams();
  const { user: currentUser, logout, token, updateUser } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileImage, setProfileImage] = useState(
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  );
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const user = isOwnProfile ? currentUser : profileUser;

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch: watchProfile,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        let userData;

        if (isOwnProfile) {
          const response = await userApi.getUserProfile(token);
          if (response.success && response.data) {
            userData = response.data;
            updateUser(userData);
          }
        } else {
          // Fetch other user's profile
          const response = await userApi.getUserById(token, userId);
          if (response.success && response.data) {
            userData = response.data;
            setProfileUser(userData);
          }
        }

        if (userData?.avatar) {
          setProfileImage(userData.avatar);
        }

        if (isOwnProfile && userData) {
          setProfileValue("username", userData.username || "");
          setProfileValue("name", userData.name || "");
          setProfileValue("email", userData.email || "");
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: error.message,
          type: "error",
        });
        if (!isOwnProfile) {
          navigate("/dashboard/users");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token, userId, isOwnProfile]);

  const onSubmitProfile = async (data) => {
    try {
      setIsLoading(true);
      console.log("Submitting profile data:", data);

      // Create update data object with trimmed values
      const updateData = {
        name: data.name?.trim(),
        username: data.username?.trim(),
      };

      // Only include fields that have values
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      if (Object.keys(updateData).length === 0) {
        addToast({
          title: "No changes",
          description: "No changes were made to your profile",
          type: "info",
        });
        return;
      }

      const response = await userApi.updateProfile(token, updateData);
      console.log("Server response:", response); // Debug log

      if (response.success && response.data) {
        updateUser(response.data);

        // Update form values with the response
        setProfileValue("name", response.data.name || "");
        setProfileValue("username", response.data.username || "");

        addToast({
          title: "Success",
          description: "Your profile has been updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setIsLoading(true);
      await userApi.changePassword(token, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      addToast({
        title: "Password updated",
        description: "Your password has been changed successfully",
        type: "success",
      });

      resetPassword();
    } catch (error) {
      addToast({
        title: "Error",
        description: error.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file);

      // Create preview URL and show cropper
      const previewUrl = URL.createObjectURL(file);
      setCropperImage(previewUrl);
      setShowCropper(true);
    } catch (error) {
      console.error("Profile picture upload error:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to process image",
        type: "error",
      });
    } finally {
      // Reset file input
      event.target.value = "";
    }
  };

  const handleCropComplete = async (croppedImage) => {
    setShowCropper(false);
    URL.revokeObjectURL(cropperImage);
    setCropperImage(null);

    try {
      setIsLoading(true);
      setProfileImage(croppedImage.url);

      // Compress image before upload
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      let fileToUpload;
      try {
        fileToUpload = await imageCompression(
          croppedImage.file,
          compressionOptions
        );
        console.log("Compression complete:", {
          originalSize:
            (croppedImage.file.size / 1024 / 1024).toFixed(2) + "MB",
          compressedSize: (fileToUpload.size / 1024 / 1024).toFixed(2) + "MB",
        });
      } catch (compressionError) {
        console.warn("Image compression failed:", compressionError);
        fileToUpload = croppedImage.file;
      }

      // Create and verify FormData
      const formData = new FormData();
      formData.append("avatar", fileToUpload);

      // Upload to server
      const response = await userApi.updateProfile(token, formData);
      console.log("Server response:", response);

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      // Update UI with new avatar
      const avatarUrl = response.data?.avatar;
      if (avatarUrl) {
        setProfileImage(avatarUrl);
        updateUser(response.data);

        addToast({
          title: "Success",
          description: "Profile picture updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Profile picture upload error:", error);

      // Revert to previous avatar
      setProfileImage(user?.avatar || IMAGE_CONSTANTS.DEFAULT_AVATAR);

      addToast({
        title: "Error",
        description: error.message || "Failed to update profile picture",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      URL.revokeObjectURL(croppedImage.url);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage);
      setCropperImage(null);
    }
  };

  // Separate validation function
  const validateImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Please upload a valid image file (JPG, PNG, or GIF)");
    }

    if (file.size > maxSize) {
      throw new Error("Image size should be less than 5MB");
    }
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

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.warn("Image compression failed:", error);
      return file;
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      {showCropper && cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}

      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/dashboard/users"
          className="text-gray-900 dark:text-gray-300"
        >
          Users
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-500">Profile</span>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="px-3 py-3">
            <CardHeader className="border-0">
              <CardTitle className="font-bold">
                {isOwnProfile ? "Personal Information" : "User Information"}
              </CardTitle>
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
                    {isOwnProfile && (
                      <label
                        className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-sm hover:bg-primary-600 transition-colors cursor-pointer"
                        aria-label="Change profile picture"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.querySelector("input").click();
                          }
                        }}
                      >
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isLoading}
                          aria-label="Upload profile picture"
                        />
                        <Edit2
                          className="h-4 w-4"
                          aria-hidden="true"
                          color="teal"
                        />
                      </label>
                    )}
                  </div>
                  {isOwnProfile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recommended: 400x400px JPG, PNG
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                    <Input
                      label="Full Name"
                      {...(isOwnProfile && registerProfile("name"))}
                      error={isOwnProfile && profileErrors.name?.message}
                      leftIcon={<User className="h-4 w-4 text-gray-400" />}
                      placeholder="Enter your full name"
                      disabled={!isOwnProfile || isLoading}
                    />

                    <Input
                      label="Username"
                      {...(isOwnProfile && registerProfile("username"))}
                      error={isOwnProfile && profileErrors.username?.message}
                      leftIcon={<AtSign className="h-4 w-4 text-gray-400" />}
                      placeholder="Choose a unique username"
                      disabled={!isOwnProfile || isLoading}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={user?.email || ""}
                      disabled={true}
                      leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                      placeholder="Email address"
                    />

                    {isOwnProfile && (
                      <Button
                        type="submit"
                        variant="teal"
                        size="md"
                        disabled={isLoading}
                        className="mt-4"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isOwnProfile && (
          <>
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
                    <form
                      onSubmit={handleSubmitPassword(onSubmitPassword)}
                      className="space-y-2 max-w-md"
                    >
                      <Input
                        label="Current Password"
                        type="password"
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        error={passwordErrors.currentPassword?.message}
                        leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                        placeholder="Enter current password"
                      />

                      <Input
                        label="New Password"
                        type="password"
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                        })}
                        error={passwordErrors.newPassword?.message}
                        leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                        placeholder="Enter new password"
                      />

                      <Input
                        label="Confirm New Password"
                        type="password"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === watchPassword("newPassword") ||
                            "Passwords do not match",
                        })}
                        error={passwordErrors.confirmPassword?.message}
                        leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                        placeholder="Confirm new password"
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="xs"
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
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
                          className="text-gray-900 dark:text-gray-300"
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
              {/* <motion.div
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
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                            Email Notifications
                          </h4>
                          <p className="text-xxs text-gray-500 dark:text-gray-400">
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
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                            Blog Updates
                          </h4>
                          <p className="text-xxs text-gray-500 dark:text-gray-400">
                            Get notified about blog generation status
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleNotification("blogUpdates")
                          }
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
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                            New Features
                          </h4>
                          <p className="text-xxs text-gray-500 dark:text-gray-400">
                            Learn about new features and updates
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleNotification("newFeatures")
                          }
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
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                            Tips & Tutorials
                          </h4>
                          <p className="text-xxs text-gray-500 dark:text-gray-400">
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
                      size="xs"
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
              </motion.div> */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* <motion.div
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
                          size="xs"
                          onClick={() => handleConnect("wordpress")}
                        >
                          {connectedAccounts.wordpress
                            ? "Disconnect"
                            : "Connect"}
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
                          variant={
                            connectedAccounts.google ? "outline" : "primary"
                          }
                          size="xs"
                          onClick={() => handleConnect("google")}
                          className="text-gray-900 dark:text-gray-300"
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
                          size="xs"
                          onClick={() => handleConnect("facebook")}
                        >
                          {connectedAccounts.facebook
                            ? "Disconnect"
                            : "Connect"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="xs"
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
              </motion.div> */}
            </div>
          </>
        )}
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
