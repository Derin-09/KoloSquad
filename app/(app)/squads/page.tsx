"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Compass, Filter, Plus, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { useSquadStore } from "@/stores/squad-store"
import { useAuthStore } from "@/stores/auth-store"

type SquadCategory = "All Squads" | "Travel" | "Tech" | "Emergency" | "Real Estate" | "Education" | "Wedding"

const categories: SquadCategory[] = [
  "All Squads",
  "Travel",
  "Tech",
  "Emergency",
  "Real Estate",
  "Education",
  "Wedding",
]

export default function SquadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<SquadCategory>("All Squads")
  const router = useRouter()
  const queryClient = useQueryClient()

  const squads = useSquadStore((state) => state.stats)
  const fetchSquad = useSquadStore((state) => state.fetchSquad)
  const user = useAuthStore((state) => state.user)
  const { isLoading, isError } = useSquadStore()

  useEffect(() => {
    if (user?.id) fetchSquad(user.id)
  }, [fetchSquad, user?.id])

  const filteredSquads = useMemo(() => {
    const source = squads || []
    const query = searchQuery.trim().toLowerCase()

    return source.filter((squad) => {
      const category = ((squad as { category?: string }).category || "General").trim()
      const nameMatch = squad.name.toLowerCase().includes(query)
      const goalMatch = String(squad.target_amount || 0).includes(query)
      const categoryMatch =
        activeCategory === "All Squads" || category.toLowerCase() === activeCategory.toLowerCase()

      return (nameMatch || goalMatch) && categoryMatch
    })
  }, [activeCategory, searchQuery, squads])

  const getAchievedPercent = (saved: number, target: number) => {
    if (!target || target <= 0) return 0
    return Math.min(100, Math.round((saved / target) * 100))
  }

  const currency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value || 0)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this squad?")) return

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) throw new Error("Not signed in")

      const { data: squad } = await supabase
        .from("squads")
        .select("created_by")
        .eq("id", id)
        .single()

      if (!squad || squad.created_by !== currentUser.id) {
        throw new Error("Only the owner can delete this squad")
      }

      const { error } = await supabase.from("squads").delete().eq("id", id)
      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["user-squads"] })
      alert("Squad deleted successfully")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete squad")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 pb-24">
      <section className="space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your Squads</h1>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by squad name or goal..."
              className="h-12 w-full rounded-full border border-border bg-surface/70 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-(--accent-input-focus)"
            />
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = activeCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    selected
                      ? "bg-(--accent) text-accent-foreground"
                      : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {isLoading && (!squads || squads.length === 0) ? (
        <p className="text-muted-foreground">Loading squads...</p>
      ) : isError ? (
        <p className="text-red-500">Could not load squads. Please refresh.</p>
      ) : filteredSquads.length === 0 ? (
        <p className="text-muted-foreground">No squads matched your current filters.</p>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSquads.map((squad) => {
            const saved = Number(squad.balance || 0)
            const target = Number(squad.target_amount || 0)
            const achieved = getAchievedPercent(saved, target)
            const members = squad.members || []
            const cardCategory = ((squad as { category?: string }).category || "General").trim()

            return (
              <article
                key={squad.id}
                className="group relative rounded-3xl border border-border bg-surface p-5 text-foreground shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-muted text-accent-foreground">
                    <Compass size={18} />
                  </div>
                  <span className="rounded-full bg-(--primary-foreground) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {cardCategory}
                  </span>
                </div>

                <p className="mb-2 text-2xl font-semibold leading-tight">{squad.name}</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  {members.length > 0
                    ? `${members.length} members contributing toward this goal.`
                    : "Start building this squad with your first members."}
                </p>

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-semibold text-foreground">{currency(target)}</span>
                </div>

                <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-(--accent-button)" style={{ width: `${achieved}%` }} />
                </div>

                <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center -space-x-2">
                    {members.slice(0, 2).map((member, idx) => (
                      <span
                        key={member.user_id || idx}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-(--accent-input) text-[10px] font-medium text-accent-foreground"
                      >
                        {(member.user_id || "U").slice(0, 1).toUpperCase()}
                      </span>
                    ))}
                    {members.length > 2 && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                        +{members.length - 2}
                      </span>
                    )}
                  </div>
                  <span>{achieved}% Achieved</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/squads/${squad.id}`}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-(--accent) text-sm font-semibold text-accent-foreground"
                  >
                    View Squad
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push(`/contribute?squadId=${squad.id}`)}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border px-4 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Contribute
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(squad.id)}
                  className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive opacity-0 transition group-hover:opacity-100"
                  title="Delete squad"
                >
                  <Trash2 size={14} />
                </button>
              </article>
            )
          })}
        </section>
      )}

      <Link
        href="/squads/new/step-one"
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-(--accent) px-5 text-sm font-semibold text-accent-foreground shadow-lg"
      >
        <Plus size={18} />
        Create New
      </Link>
    </div>
  )
}
