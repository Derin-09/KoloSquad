"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib//supabase/client";
import NewContributionPlan from "./[id]/new/page";
// import NewContributionPlan from "./new/page";

interface Contribution {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContributions() {
      setLoading(true);

    


      const { data, error } = await supabase
        .from("contributions")
        .select("id, amount, status, created_at")
        .eq("squad_id", params.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contributions:", error);
      } else {
        setContributions(data || []);
      }

      setLoading(false);
    }

    fetchContributions();
  }, [params.id]);

  return (
    <div className="space-y-8">
      <NewContributionPlan params={{id: params.id}} />

      <section>
        <h2 className="text-lg font-semibold mb-4">Contribution History</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading history...</p>
        ) : contributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contributions yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {contributions.map((contribution) => (
              <li
                key={contribution.id}
                className="border rounded-xl p-4 bg-background flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    ₦{contribution.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contribution.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    contribution.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : contribution.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {contribution.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}










// import NewContributionPlan from "./[id]/new/page";

// export default function Page({ params }: { params: { id: string } }) {
//   return <NewContributionPlan squadId={params.id} />;
// }
