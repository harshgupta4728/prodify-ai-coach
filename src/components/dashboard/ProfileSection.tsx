import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Camera, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

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
    leetcodeProfile?: string;
    geeksforgeeksProfile?: string;
  };
  onProfileUpdate: (updatedUser: any) => void;
}

export const ProfileSection = ({ userData, onProfileUpdate }: ProfileSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      console.log('Saving profile data:', profileData);
      
      const response = await apiService.updateProfile(profileData);
      
      console.log('Profile update response:', response);
      
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
          >
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={userData.name} />
                <AvatarFallback className="text-lg">
                  {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          // For now, just show a toast notification
                          toast({
                            title: "Profile picture updated!",
                            description: "Profile picture upload functionality will be implemented soon.",
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={isLoading}
                  />
                ) : (
                  <p className="text-lg font-medium">{userData.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={isLoading}
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {profileData.bio || "No bio added yet."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University / College</Label>
              {isEditing ? (
                <Input
                  id="university"
                  placeholder="Your university name"
                  value={profileData.university}
                  onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-muted-foreground">
                  {profileData.university || "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major / Field of Study</Label>
              {isEditing ? (
                <Input
                  id="major"
                  placeholder="Your major"
                  value={profileData.major}
                  onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-muted-foreground">
                  {profileData.major || "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Expected Graduation Year</Label>
              {isEditing ? (
                <Input
                  id="graduationYear"
                  placeholder="2024"
                  value={profileData.graduationYear}
                  onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-muted-foreground">
                  {profileData.graduationYear || "Not specified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-muted-foreground">
                  {profileData.location || "Not specified"}
                </p>
              )}
            </div>
          </div>

          {/* Portfolio Link */}
          <div className="space-y-2">
            <Label htmlFor="portfolio">Personal Portfolio / Website</Label>
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
              <p className="text-muted-foreground">
                {profileData.portfolio ? (
                  <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profileData.portfolio}
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 