import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  avatar_url?: string;
  name?: string;
}

export function useUserProfiles(userIds: string[]) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  useEffect(() => {
    if (!userIds.length) {
      setProfiles([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, full_name')
        .in('id', userIds);
                console.log(data, 'members')
      if (!cancelled && data) setProfiles(data);
    })();
    
    return () => { cancelled = true; };
  }, [userIds]);
  return profiles;
}
