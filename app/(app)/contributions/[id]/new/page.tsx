
import NewContributionPlan from "./NewContributionClient";

interface PageProps {
  params: Promise<{ id: string }>; // App Router expects a promise
}

// Make the page a server component (async)
export default async function Page({ params }: PageProps) {
  const resolvedParams = await params; // resolve the promise
  return <NewContributionPlan squadId={resolvedParams.id} />;
}




// import NewContributionPlan from "./NewContributionClient";

// export default function Page({ params }: { params: { id: string } }) {
//   return <NewContributionPlan squadId={params.id} />;
// }








