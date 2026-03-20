import type { Note } from "@/hooks/useNotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Pin, Archive, Tag, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface DashboardPanelProps {
  stats: { total: number; pinned: number; archived: number; trash: number };
  allTags: { tag: string; count: number }[];
  notes: Note[];
}

export function DashboardPanel({ stats, allTags, notes }: DashboardPanelProps) {
  const activityData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    return days.map((day) => ({
      day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
      count: notes.filter((n) => n.updated_at.slice(0, 10) === day).length,
    }));
  }, [notes]);

  const maxActivity = Math.max(...activityData.map((d) => d.count), 1);

  const statCards = [
    { label: "Total Notes", value: stats.total, icon: StickyNote, color: "text-info" },
    { label: "Pinned", value: stats.pinned, icon: Pin, color: "text-warning" },
    { label: "Archived", value: stats.archived, icon: Archive, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-end justify-between gap-2 h-32">
              {activityData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-md transition-all relative overflow-hidden"
                    style={{ height: `${Math.max((d.count / maxActivity) * 100, 4)}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-primary rounded-md"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top tags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" /> Most Used Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {allTags.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tags yet</p>
            ) : (
              <div className="space-y-2">
                {allTags.slice(0, 8).map(({ tag, count }) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{tag}</Badge>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / (allTags[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
