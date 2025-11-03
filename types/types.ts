export interface Squad {
    id: string
    name: string
    target_amount: number | null
    created_at: string
    invite_code: string
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
