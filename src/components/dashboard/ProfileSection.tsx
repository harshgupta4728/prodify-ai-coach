import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { apiService } from "@/lib/api";
import { config } from "@/lib/config";
import { cn, safeExternalUrl } from "@/lib/utils";

interface ProfileSectionProps {
  userData: {
    name: string;
    email: string;
    bio?: string;
    university?: string;
    major?: string;
    graduationYear?: string;
    location?: string;
    portfolio?: string;
    profilePicture?: string;
  };
  onProfileUpdate: (updatedUser: any) => void;
}

// One profile field: a form label while editing, a small mono label above the saved value otherwise
const Field = ({
  id, label, isEditing, className, children,
}: {
  id: string;
  label: string;
  isEditing: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("min-w-0 space-y-2", className)}>
    {isEditing ? <Label htmlFor={id}>{label}</Label> : <p className="eyebrow">{label}</p>}
    {children}
  </div>
);

const FieldValue = ({ value }: { value: string }) => (
  <p className="break-words text-sm">{value || <span className="text-muted-foreground">Not specified</span>}</p>
);

export const ProfileSection = ({ userData, onProfileUpdate }: ProfileSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData.name,
    bio: userData.bio || "",
    university: userData.university || "",
    major: userData.major || "",
    graduationYear: userData.graduationYear || "",
    location: userData.location || "",
    portfolio: userData.portfolio || ""
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.updateProfile(profileData);
      onProfileUpdate(response.user);
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: userData.name,
      bio: userData.bio || "",
      university: userData.university || "",
      major: userData.major || "",
      graduationYear: userData.graduationYear || "",
      location: userData.location || "",
      portfolio: userData.portfolio || ""
    });
    setIsEditing(false);
  };

  const handleProfilePictureUpload = async (file: File) => {
    // Same limits as the server, checked first so the user gets a clear message right away
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast({ title: "Unsupported image", description: "Please choose a JPEG, PNG, WebP or GIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 5 MB.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const response = await apiService.uploadProfilePicture(file);
      onProfileUpdate(response.user);
      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been successfully uploaded.",
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    setIsUploading(true);
    try {
      const response = await apiService.removeProfilePicture();
      onProfileUpdate(response.user);
      toast({
        title: "Profile picture removed!",
        description: "Your profile picture has been successfully removed.",
      });
    } catch (error) {
      console.error('Profile picture removal error:', error);
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Up to two letters, same as the sidebar
  const initials = userData.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences"
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)} disabled={isLoading}>
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          )
        }
      />

      {/* Identity: photo, name, email and bio */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border sm:h-20 sm:w-20">
            <AvatarImage
              src={userData.profilePicture ? `${config.apiBaseUrl.replace('/api', '')}${userData.profilePicture}` : ""}
              alt={userData.name}
            />
            <AvatarFallback className="font-mono text-lg font-medium">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold leading-tight">{userData.name}</h2>
              <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{userData.email}</p>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/jpeg,image/png,image/webp,image/gif';
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        const file = target.files?.[0];
                        if (file) {
                          handleProfilePictureUpload(file);
                        }
                      };
                      input.click();
                    }}
                    title="Upload new photo"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    Upload new photo
                  </Button>
                  {userData.profilePicture && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isUploading}
                      onClick={handleRemoveProfilePicture}
                      title="Remove photo"
                    >
                      <Trash2 className="h-4 w-4" /> Remove photo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF, up to 5 MB.</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {profileData.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Details: two columns on wider screens, one on phones */}
      <Card>
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Details</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {isEditing && (
              <>
                <Field id="name" label="Full Name" isEditing className="sm:col-span-2">
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={isLoading}
                  />
                </Field>

                <Field id="bio" label="Bio / About Me" isEditing className="sm:col-span-2">
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={isLoading}
                    rows={3}
                  />
                </Field>
              </>
            )}

            <Field id="university" label="University / College" isEditing={isEditing}>
              {isEditing ? (
                <Input
                  id="university"
                  placeholder="Your university name"
                  value={profileData.university}
                  onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <FieldValue value={profileData.university} />
              )}
            </Field>

            <Field id="major" label="Major / Field of Study" isEditing={isEditing}>
              {isEditing ? (
                <Input
                  id="major"
                  placeholder="Your major"
                  value={profileData.major}
                  onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <FieldValue value={profileData.major} />
              )}
            </Field>

            <Field id="graduationYear" label="Expected Graduation Year" isEditing={isEditing}>
              {isEditing ? (
                <Input
                  id="graduationYear"
                  placeholder="2024"
                  value={profileData.graduationYear}
                  onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <FieldValue value={profileData.graduationYear} />
              )}
            </Field>

            <Field id="location" label="Location" isEditing={isEditing}>
              {isEditing ? (
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <FieldValue value={profileData.location} />
              )}
            </Field>

            <Field id="portfolio" label="Personal Portfolio / Website" isEditing={isEditing} className="sm:col-span-2">
              {isEditing ? (
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={profileData.portfolio}
                  onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="break-all text-sm">
                  {safeExternalUrl(profileData.portfolio) ? (
                    <a
                      href={safeExternalUrl(profileData.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary underline-offset-4 hover:underline"
                    >
                      {profileData.portfolio}
                    </a>
                  ) : profileData.portfolio ? (
                    profileData.portfolio
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </p>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
