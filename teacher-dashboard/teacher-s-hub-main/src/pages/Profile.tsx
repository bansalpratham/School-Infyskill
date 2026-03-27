import { Mail, Phone, MapPin, Calendar, Award, BookOpen, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">SJ</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">Sarah Johnson</h1>
            <p className="text-muted-foreground">Senior Mathematics Teacher</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Mathematics</span>
              <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">Class Teacher - 10A</span>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">sarah.johnson@school.edu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">123 Education Lane, School City</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">August 2018</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">12 Years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Qualification</p>
                <p className="font-medium">M.Sc Mathematics, B.Ed</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <Card className="p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Classes Taught", value: "156" },
            { label: "Students Managed", value: "450+" },
            { label: "Awards Won", value: "8" },
            { label: "Avg. Student Score", value: "85%" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
