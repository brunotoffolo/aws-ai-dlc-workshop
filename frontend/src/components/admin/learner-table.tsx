interface Props { learners: Array<Record<string, unknown>> }

export function LearnerTable({ learners }: Props) {
  if (learners.length === 0) return <p className="text-muted-foreground">No learners found.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border" data-testid="learner-table">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Curricula</th>
            <th className="px-4 py-3 text-left font-medium">Avg Progress</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {learners.map((l) => (
            <tr key={l.user_id as string} className="border-t" data-testid={`learner-row-${l.user_id}`}>
              <td className="px-4 py-3">{l.email as string}</td>
              <td className="px-4 py-3">{l.curriculum_count as number ?? 0}</td>
              <td className="px-4 py-3">{Math.round((l.avg_progress as number ?? 0))}%</td>
              <td className="px-4 py-3 capitalize">{(l.status ?? "active") as string}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
