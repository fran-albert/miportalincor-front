import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "@/components/Tabs/Pre-Occupational/General";
import MedicalHistoryTab from "@/components/Tabs/Pre-Occupational/Medical-History";
import VariousTab from "../Various";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function NavigationTabs({ isEditing, setIsEditing }: Props) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto space-y-4">
        <Card>
          <CardContent className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full text-greenPrimary"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 text-greenPrimary">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="medical-history">
                  Historia Médica
                </TabsTrigger>
                <TabsTrigger value="various">Varios</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {activeTab === "general" && (
                  <GeneralTab
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "medical-history" && (
                  <MedicalHistoryTab
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "various" && (
                  <VariousTab isEditing={isEditing} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
