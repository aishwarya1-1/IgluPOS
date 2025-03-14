'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,

} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { getUserProfile, updateUserProfile, resetUserPassword } from '@/app/lib/actions';

// Define the User Profile type
type UserProfile = {
  id: number;
  email: string;
  username: string;
  address: string | null;
  gstNumber: string | null;
};

export default function ProfilePage() {
  const { userId } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserProfile() {
      if (userId) {
        try {
          setIsLoading(true);
          const data = await getUserProfile(parseInt(userId));
          setUserProfile(data);
        } catch  {
          toast({
            title: "Error",
            description: "Failed to fetch profile information",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchUserProfile();
  }, [userId, toast]);

  const handleRefreshProfile = async () => {
    if (userId) {
      const data = await getUserProfile(parseInt(userId));
      setUserProfile(data);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="container mx-auto px-4 py-16 text-center">Profile not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and edit your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <EditProfileForm 
              profile={userProfile} 
              onCancel={() => setIsEditing(false)}
              onSuccess={() => {
                handleRefreshProfile();
                setIsEditing(false);
              }}
            />
          ) : (
            <ProfileView 
              profile={userProfile} 
              onEdit={() => setIsEditing(true)}
              onPasswordReset={() => setIsPasswordDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <PasswordResetForm 
            userId={userProfile.id} 
            onClose={() => setIsPasswordDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileView({ 
  profile, 
  onEdit,
  onPasswordReset
}: { 
  profile: UserProfile; 
  onEdit: () => void;
  onPasswordReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-base">{profile.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Username</h3>
          <p className="mt-1 text-base">{profile.username}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p className="mt-1 text-base">{profile.address || "Not provided"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
          <p className="mt-1 text-base">{profile.gstNumber || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mt-6">
        <Button onClick={onEdit} className="flex-1">
          Edit Profile
        </Button>
        <Button 
          variant="outline" 
          onClick={onPasswordReset}
          className="flex-1"
        >
          Reset Password
        </Button>
      </div>
    </div>
  );
}

function EditProfileForm({ 
  profile, 
  onCancel,
  onSuccess
}: { 
  profile: UserProfile; 
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateUserProfile(profile.id, formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch  {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={profile.email}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          defaultValue={profile.username}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          defaultValue={profile.address || ""}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
          GST Number
        </label>
        <input
          type="text"
          id="gstNumber"
          name="gstNumber"
          defaultValue={profile.gstNumber || ""}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function PasswordResetForm({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await resetUserPassword(userId, formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password reset successfully",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            required
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 pr-10 ${
              passwordError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {passwordError && (
          <p className="mt-2 text-sm text-red-600">{passwordError}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );
}