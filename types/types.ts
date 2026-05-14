export type Contribution = { amount: number; status: string };
export type Member = { user_id: string };

export interface UserType {
    id: string;
    aud: string;
    role: string;
    email: string;
    phone: string;
    email_confirmed_at: string | null;
    phone_confirmed_at?: string | null;
    confirmation_sent_at: string | null;
    confirmed_at: string | null;
    last_sign_in_at: string | null;
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
    app_metadata: {
        provider: string;
        providers: string[];
    };
    user_metadata: {
        avatar_url: string | null;
        email: string;
        email_verified: boolean;
        full_name: string | null;
        phone_verified: boolean;
        squad_nickname: string | null;
        sub: string;
    };
    identities: Array<{
        identity_id: string;
        id: string;
        user_id: string;
        identity_data: {
            email: string;
            email_verified: boolean;
            full_name: string | null;
            phone_verified: boolean;
            sub: string;
        };
        provider: string;
        last_sign_in_at: string | null;
        created_at: string;
        updated_at: string;
        email: string;
    }>;
}



export interface Squad {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  invite_code: string;
  contributions: Contribution[] | null;
  members: Member[] | null;
}

export interface SquadIdType {
    id: string
    name: string
    target_amount: number | null
    created_by: string
    invite_code: string
}

export interface PlanType {
    squad_id: string,
    id: string
    created_by: string,
    frequency: string,
    amount: number | null,
    type: string,
    start_date: string,
    end_date: string,
    next_due_date: string,
    approvals: string[]
    status: string
}

export interface PlanDataType {
    id: string,
    frequency: string,
    amount: number,
    type: string,
    start_date: string,
    end_date: string,
    next_due_date: string,
    name: string
    target_amount: number
}

export interface ContributionType {
    amount: number
    status: string
    created_at: string
}

export interface MemberType {
    user_id: string
    role: string
    profiles?: {
        full_name?: string | null
        avatar_url?: string | null
    }
}


export interface BadgeType {
  user_id: string;
  squad_id: string;
  awarded_at: string;
  code: string;
}

export interface BadgeCatalogType {
    code: string;
    title: string;
    description: string | null;
    icon: string | null;
    xp_reward: number | null;
}
export interface ChallengesType {
  title: string;
  type: string;
  xp_award: number;
}
export interface LeaderboardType {
  user_id: string;
  squad_id: string;
  full_name: string;
  total_contributed: number;
}
export interface ActivitiesType {
  user_id: string;
  squad_id: string;
  type: string;
  title: string;
  metadata: string;
  created_at: string;
}

