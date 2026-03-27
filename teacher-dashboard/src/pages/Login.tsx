import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await apiRequest<any>("/api/auth/login", {
        method: "POST",
        body: { email, password }
      });

      const token = res?.data?.token;
      const user = res?.data?.user;

      const normalizedUser = user
        ? {
            ...user,
            userId: String(user.userId || user.id || user._id || "").trim() || undefined,
          }
        : null;

      const allowedSchoolIds: unknown = normalizedUser?.allowedSchoolIds;
      const derivedSchoolId = Array.isArray(allowedSchoolIds) && allowedSchoolIds.length > 0
        ? String(allowedSchoolIds[0] || "").trim()
        : "";

      if (!token) {
        throw new Error("Login failed");
      }

      if (normalizedUser?.role && String(normalizedUser.role) !== "teacher") {
        throw new Error("Access denied");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("schoolId");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("isAuthenticated", "true");

      if (derivedSchoolId) {
        localStorage.setItem("schoolId", derivedSchoolId);
      }
      
      toast({
        title: "Success",
        description: "Login successful!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as any)?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">Teacher's Hub</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Demo credentials available on request</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
