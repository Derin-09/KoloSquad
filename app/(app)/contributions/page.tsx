import NewContributionPlan from "./[id]/new/page";

export default function Page({ params }: { params: { id: string } }) {
  return <NewContributionPlan squadId={params.id} />;
}
