// app/(app)/contributions/[id]/page.tsx
// import ContributionsClient from "./ContributionsClient";

import ContributionsClient from "./ContributionClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ContributionsClient squadId={resolvedParams.id} />;
}





