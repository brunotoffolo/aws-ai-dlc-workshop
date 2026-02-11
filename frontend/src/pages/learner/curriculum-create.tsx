import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FreeTextForm } from "@/components/curriculum/free-text-form";
import { GuidedWizard } from "@/components/curriculum/guided-wizard";

export default function CurriculumCreatePage() {
  return (
    <div className="mx-auto max-w-2xl p-6" data-testid="curriculum-create-page">
      <h1 className="mb-6 text-2xl font-bold">Create Curriculum</h1>
      <Tabs defaultValue="freetext">
        <TabsList className="w-full">
          <TabsTrigger value="freetext" className="flex-1" data-testid="tab-freetext">Free Text</TabsTrigger>
          <TabsTrigger value="wizard" className="flex-1" data-testid="tab-wizard">Guided Wizard</TabsTrigger>
        </TabsList>
        <TabsContent value="freetext"><FreeTextForm /></TabsContent>
        <TabsContent value="wizard"><GuidedWizard /></TabsContent>
      </Tabs>
    </div>
  );
}
