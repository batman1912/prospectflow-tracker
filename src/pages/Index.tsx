import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AppointmentTracker } from "@/components/AppointmentTracker";
import { SpiffTracker } from "@/components/SpiffTracker";
import { WeeklyReports } from "@/components/WeeklyReports";
import { Statistics } from "@/components/Statistics";
import { MeetingsList } from "@/components/MeetingsList";

const Index = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  
  // Shared state for appointments that integrates with other components
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      firstName: "Manikant",
      lastName: "Ojha",
      title: "VP Sales",
      email: "manikant@company.com",
      company: "TechCorp Inc",
      number: "+1-555-0123",
      linkedin: "linkedin.com/in/manikant-ojha",
      country: "United States",
      scheduledOn: "2024-01-15",
      scheduledFor: "2024-01-20",
      conducted: true,
      noShow: false,
      opportunity: true,
      notes: "High potential prospect",
      rescheduleComments: "",
      meetingNotes: "Great conversation about needs",
      sdrName: "John Smith"
    }
  ]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appointments":
        return <AppointmentTracker appointments={appointments} onAppointmentChange={setAppointments} />;
      case "meetings":
        return <MeetingsList meetings={appointments} />;
      case "weekly":
        return <WeeklyReports meetings={[]} appointments={appointments} />;
      case "spiff":
        return <SpiffTracker />;
      case "stats":
        return <Statistics />;
      default:
        return <AppointmentTracker appointments={appointments} onAppointmentChange={setAppointments} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
};

export default Index;
