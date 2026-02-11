import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardCategories, useGenerateCurriculum } from "@/hooks/api/use-curriculum";
import { ChevronRight } from "lucide-react";

interface Category { name: string; subcategories?: Category[] }

export function GuidedWizard() {
  const navigate = useNavigate();
  const { data, isLoading } = useWizardCategories();
  const generate = useGenerateCurriculum();
  const [path, setPath] = useState<string[]>([]);

  const categories = (data?.data ?? []) as Category[];

  const current = path.reduce<Category[]>((cats, name) => {
    const found = cats.find((c) => c.name === name);
    return found?.subcategories ?? [];
  }, categories);

  const hasChildren = current.length > 0;
  const selectedTopic = path[path.length - 1];

  const handleSelect = (name: string) => {
    const next = [...path, name];
    const sub = current.find((c) => c.name === name)?.subcategories;
    if (sub && sub.length > 0) {
      setPath(next);
    } else {
      setPath(next);
    }
  };

  const handleGenerate = () => {
    if (!selectedTopic) return;
    generate.mutate({ topic: path.join(" > "), test_type: "mixed", program_level: "intermediate" }, {
      onSuccess: (res) => navigate(`/curricula/${res.data.curriculum_id}`, { state: { generating: true } }),
    });
  };

  if (isLoading) return <p className="pt-4 text-muted-foreground">Loading categories...</p>;

  return (
    <div className="space-y-4 pt-4" data-testid="guided-wizard">
      {path.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <button onClick={() => setPath([])} className="hover:text-foreground" data-testid="wizard-breadcrumb-root">All</button>
          {path.map((p, i) => (
            <span key={p} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => setPath(path.slice(0, i + 1))} className="hover:text-foreground">{p}</button>
            </span>
          ))}
        </div>
      )}

      {hasChildren ? (
        <div className="grid gap-2">
          {current.map((cat) => (
            <Card key={cat.name} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => handleSelect(cat.name)}>
              <CardContent className="flex items-center justify-between p-4">
                <span>{cat.name}</span>
                {cat.subcategories && cat.subcategories.length > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected topic: <span className="font-medium">{path.join(" > ")}</span></p>
          <Button onClick={handleGenerate} className="w-full" disabled={generate.isPending} data-testid="wizard-generate-button">
            {generate.isPending ? "Generating..." : "Generate Curriculum"}
          </Button>
        </div>
      )}
    </div>
  );
}
