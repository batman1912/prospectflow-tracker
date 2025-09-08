import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AppointmentTracker } from "@/components/AppointmentTracker";
import { SpiffTracker } from "@/components/SpiffTracker";
import { WeeklyReports } from "@/components/WeeklyReports";
import { Statistics } from "@/components/Statistics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appointments":
        return <AppointmentTracker />;
      case "spiff":
        return <SpiffTracker />;
      case "weekly":
        return <WeeklyReports />;
      case "stats":
        return <Statistics />;
      default:
        return <AppointmentTracker />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
};

export default Index;
