export interface UserProfile {
    id: string
    name: string
    dateOfBirth: string // ISO format (YYYY-MM-DD)
    country: string
    customDeathDate?: string // ISO format (YYYY-MM-DD), optional
    createdAt: string
    updatedAt: string
}

export interface UserProfileInput {
    name: string
    dateOfBirth: string
    country: string
    customDeathDate?: string
}
