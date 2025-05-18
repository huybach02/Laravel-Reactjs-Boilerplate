export type UserResponse = {
    user: User;
};

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    province_id: string;
    district_id: string;
    ward_id: string;
    address: string;
    birthday: string;
    image: string;
    description: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
}
