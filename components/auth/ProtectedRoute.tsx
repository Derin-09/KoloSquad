"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();

    // 🔄 Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!session) {
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setSession(session);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-[color:var(--accent-foreground)]">
        <div className="size-10 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return <>{session ? children : null}</>;
}








// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase/client";

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const [loading, setLoading] = useState(true);
//   const [session, setSession] = useState<any>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const getSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       if (!data.session) {
//         router.replace("/sign-in"); // redirect to sign-in if not authenticated
//       } else {
//         setSession(data.session);
//       }
//       setLoading(false);
//     };

//     getSession();

//     // listen for auth changes (log in/out)
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (!session) {
//         router.replace("/sign-in");
//       } else {
//         setSession(session);
//       }
//     });

//     return () => {
//       listener?.subscription.unsubscribe();
//     };
//   }, [router]);

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-screen text-[color:var(--accent-foreground)]">
//         <div className="size-10 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );

//   return <>{session ? children : null}</>;
// }
