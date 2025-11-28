import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, User, Mail, Trash2, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate("/auth");
                return;
            }

            setUser(user);
            setEmail(user.email || "");
            setAvatarUrl(user.user_metadata?.avatar_url || "");
        } catch (error: any) {
            console.error("Error loading user data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateEmail = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ email: email });

            if (error) throw error;

            toast({
                title: "Email update initiated",
                description: "Check your new email for a confirmation link.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error updating email",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            // Try to upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                // If bucket doesn't exist or other error, fallback to just showing the local preview for this session
                // or throw error. For this demo, we'll try to handle it.
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl },
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            toast({
                title: "Avatar updated",
                description: "Your profile picture has been updated successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error uploading avatar",
                description: error.message || "Could not upload image. Make sure 'avatars' bucket exists.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                setLoading(true);
                // Sign out user and inform them to contact support for full deletion
                await supabase.auth.signOut();
                navigate("/auth");
                toast({
                    title: "Account deletion request",
                    description: "Please contact support to fully delete your data.",
                });
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">Profile</h1>
                </div>

                <Card className="border-none shadow-lg bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your profile details and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                        {email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                                >
                                    <Upload className="w-8 h-8" />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadAvatar}
                                    disabled={uploading}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {uploading ? "Uploading..." : "Click to change profile picture"}
                            </p>
                        </div>

                        {/* Email Section */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button onClick={updateEmail} disabled={loading}>
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t">
                            <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                            <div className="flex flex-col gap-4">
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 border-t flex justify-end">
                            <Button variant="outline" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
