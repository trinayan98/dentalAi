import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useForm } from "react-hook-form";
import { useToastStore } from "../../stores/toastStore";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function AdminSettings() {
  const { addToast } = useToastStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteName: "AI Blog Platform",
      siteDescription: "A platform for creating AI-powered blog content",
      maxUsersAllowed: 1000,
      maxBlogsPerUser: 50,
    },
  });

  const onSubmit = async (data) => {
    try {
      // TODO: Implement settings update
      console.log("Settings data:", data);
      addToast({
        title: "Success",
        description: "Settings updated successfully",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error.message || "Failed to update settings",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <Link className="text-gray-500 ">Admin settings</Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Input
                  label="Site Name"
                  error={errors.siteName?.message}
                  {...register("siteName", {
                    required: "Site name is required",
                  })}
                />
              </div>

              <div>
                <Input
                  label="Site Description"
                  error={errors.siteDescription?.message}
                  {...register("siteDescription", {
                    required: "Site description is required",
                  })}
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Maximum Users Allowed"
                  error={errors.maxUsersAllowed?.message}
                  {...register("maxUsersAllowed", {
                    required: "Maximum users is required",
                    min: {
                      value: 1,
                      message: "Must be at least 1",
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Maximum Blogs per User"
                  error={errors.maxBlogsPerUser?.message}
                  {...register("maxBlogsPerUser", {
                    required: "Maximum blogs per user is required",
                    min: {
                      value: 1,
                      message: "Must be at least 1",
                    },
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="xs">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  API Access
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage API keys and access tokens
                </p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Audit Log
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View system activity and security events
                </p>
              </div>
              <Button variant="outline">View Log</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
