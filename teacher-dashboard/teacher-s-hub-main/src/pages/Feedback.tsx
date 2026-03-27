import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Reply, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const feedbackList = [
  {
    id: 1,
    from: "Mrs. Patel",
    student: "Aisha Patel",
    class: "10-A",
    message: "Thank you for the extra attention you've been giving Aisha in math. Her confidence has improved significantly!",
    date: "2024-03-18",
    replied: true,
    reply: "Thank you for the feedback! Aisha is working very hard and I'm proud of her progress.",
  },
  {
    id: 2,
    from: "Mr. Kumar",
    student: "Raj Kumar",
    class: "10-A",
    message: "Can we discuss Raj's performance in the upcoming parent-teacher meeting? I have some concerns about his homework completion.",
    date: "2024-03-17",
    replied: false,
  },
  {
    id: 3,
    from: "Mrs. Singh",
    student: "Priya Singh",
    class: "9-B",
    message: "Priya mentioned she's struggling with quadratic equations. Could you suggest some extra practice materials?",
    date: "2024-03-16",
    replied: true,
    reply: "I'll send some practice worksheets home with Priya. We also have after-school tutoring on Thursdays.",
  },
];

const Feedback = () => {
  const { toast } = useToast();

  const handleSendFeedback = () => {
    toast({
      title: "Feedback Sent",
      description: "Your feedback has been sent to the parent.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">Communicate with parents and guardians</p>
      </div>

      {/* Send New Feedback */}
      <Card className="p-6 animate-slide-up">
        <h3 className="font-semibold text-lg mb-4">Send Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Student</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aisha">Aisha Patel (10-A)</SelectItem>
                <SelectItem value="raj">Raj Kumar (10-A)</SelectItem>
                <SelectItem value="priya">Priya Singh (9-B)</SelectItem>
                <SelectItem value="arjun">Arjun Mehta (10-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Performance</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="appreciation">Appreciation</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea placeholder="Write your feedback message..." rows={4} />
        </div>
        <Button onClick={handleSendFeedback} className="gap-2">
          <Send className="w-4 h-4" />
          Send Feedback
        </Button>
      </Card>

      {/* Feedback List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Recent Conversations</h3>
        <div className="space-y-4">
          {feedbackList.map((feedback, index) => (
            <Card 
              key={feedback.id}
              className="p-5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold">{feedback.from}</h4>
                      <p className="text-sm text-muted-foreground">
                        Parent of {feedback.student} (Class {feedback.class})
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(feedback.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 mb-3">
                    <p>{feedback.message}</p>
                  </div>
                  
                  {feedback.replied && feedback.reply && (
                    <div className="ml-6 p-3 rounded-lg bg-primary/10 border-l-2 border-primary">
                      <p className="text-sm font-medium text-primary mb-1">Your Reply</p>
                      <p className="text-sm">{feedback.reply}</p>
                    </div>
                  )}
                  
                  {!feedback.replied && (
                    <div className="flex gap-3 mt-3">
                      <Textarea placeholder="Write your reply..." className="flex-1" rows={2} />
                      <Button size="sm" className="gap-1 self-end">
                        <Reply className="w-4 h-4" />
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
