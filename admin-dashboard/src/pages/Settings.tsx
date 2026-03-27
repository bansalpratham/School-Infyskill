import { useEffect, useMemo, useState } from "react";
import { User, Lock, Bell, School, Save, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import CustomFieldsManager from "@/components/settings/CustomFieldsManager";
import { apiRequest } from "@/lib/api";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSchool, setSavingSchool] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    feeReminders: true,
    leaveRequests: true,
  });

  const [school, setSchool] = useState({
    schoolName: "",
    phone: "",
    email: "",
    address: "",
  });

  const canSavePassword = useMemo(() => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) return false;
    return security.newPassword === security.confirmPassword;
  }, [security]);

  async function loadAll() {
    try {
      setLoading(true);

      const [p, n, s] = await Promise.all([
        apiRequest<any>("/api/settings/profile"),
        apiRequest<any>("/api/settings/notifications"),
        apiRequest<any>("/api/settings/school"),
      ]);

      const profileData = p?.data || {};
      const fullName = String(profileData?.name || "").trim();
      const parts = fullName ? fullName.split(" ") : [];
      const firstName = parts.length ? parts[0] : "";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

      setProfile({
        firstName,
        lastName,
        email: String(profileData?.email || ""),
        phone: String(profileData?.phone || ""),
      });

      const notif = n?.data || {};
      setNotifications({
        email: !!notif.emailNotifications,
        push: !!notif.pushNotifications,
        feeReminders: !!notif.feeReminders,
        leaveRequests: !!notif.leaveRequests,
      });

      const schoolData = s?.data || {};
      setSchool({
        schoolName: String(schoolData?.schoolName || ""),
        phone: String(schoolData?.phone || ""),
        email: String(schoolData?.email || ""),
        address: String(schoolData?.address || ""),
      });
    } catch (err: any) {
      toast({
        title: "Failed to load settings",
        description: err?.message || "Request failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const name = `${profile.firstName} ${profile.lastName}`.trim();
      await apiRequest<any>("/api/settings/profile", {
        method: "PUT",
        body: {
          name,
          email: profile.email,
          phone: profile.phone,
        },
      });
      toast({ title: "Settings saved", description: "Profile updated successfully." });
      await loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Request failed", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!canSavePassword) {
      toast({ title: "Error", description: "Please fill all fields and confirm password correctly.", variant: "destructive" });
      return;
    }
    try {
      setSavingSecurity(true);
      await apiRequest<any>("/api/settings/change-password", {
        method: "PUT",
        body: {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        },
      });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Request failed", variant: "destructive" });
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      await apiRequest<any>("/api/settings/notifications", {
        method: "PUT",
        body: {
          emailNotifications: notifications.email,
          pushNotifications: notifications.push,
          feeReminders: notifications.feeReminders,
          leaveRequests: notifications.leaveRequests,
        },
      });
      toast({ title: "Settings saved", description: "Notification preferences updated." });
      await loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Request failed", variant: "destructive" });
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveSchool = async () => {
    try {
      setSavingSchool(true);
      await apiRequest<any>("/api/settings/school", {
        method: "PUT",
        body: {
          schoolName: school.schoolName,
          phone: school.phone,
          email: school.email,
          address: school.address,
        },
      });
      toast({ title: "Settings saved", description: "School information updated." });
      await loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Request failed", variant: "destructive" });
    } finally {
      setSavingSchool(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="profile" className="rounded-lg gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="school" className="rounded-lg gap-2">
            <School className="w-4 h-4" />
            School
          </TabsTrigger>
          <TabsTrigger value="customFields" className="rounded-lg gap-2">
            <ListChecks className="w-4 h-4" />
            Custom Fields
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="mt-3 w-full">
                  Change Photo
                </Button>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                className="gap-2"
                onClick={handleSaveProfile}
                disabled={loading || savingProfile}
              >
                <Save className="w-4 h-4" />
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-display font-semibold">Change Password</h3>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                className="gap-2"
                onClick={handleSavePassword}
                disabled={loading || savingSecurity}
              >
                <Save className="w-4 h-4" />
                {savingSecurity ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-display font-semibold">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Fee Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified about pending fee payments</p>
                </div>
                <Switch
                  checked={notifications.feeReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, feeReminders: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Requests</p>
                  <p className="text-sm text-muted-foreground">Get notified about new leave requests</p>
                </div>
                <Switch
                  checked={notifications.leaveRequests}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, leaveRequests: checked })}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                className="gap-2"
                onClick={handleSaveNotifications}
                disabled={loading || savingNotifications}
              >
                <Save className="w-4 h-4" />
                {savingNotifications ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* School Tab */}
        <TabsContent value="school">
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
            <h3 className="text-lg font-display font-semibold">School Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={school.schoolName}
                  onChange={(e) => setSchool((s) => ({ ...s, schoolName: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={school.phone}
                    onChange={(e) => setSchool((s) => ({ ...s, phone: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={school.email}
                    onChange={(e) => setSchool((s) => ({ ...s, email: e.target.value }))}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={school.address}
                  onChange={(e) => setSchool((s) => ({ ...s, address: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                className="gap-2"
                onClick={handleSaveSchool}
                disabled={loading || savingSchool}
              >
                <Save className="w-4 h-4" />
                {savingSchool ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customFields">
          <CustomFieldsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
