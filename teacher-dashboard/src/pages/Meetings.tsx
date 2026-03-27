import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, Users, MapPin, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { apiRequest, getCurrentUser } from "@/lib/api";
const Meetings = () => {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <h1>Coming Soon...</h1>
    </div>
  );
};

export default Meetings;
