export interface PromoCode {
    id: string;
    code: string;
    usageCount: number;
    isActive: boolean;
    admin: {
      id: string;
      name: string;
      email: string;
    };
    payments: {
      id: string;
      amount: number;
      status: string;
      user?: {
        id: string;
        name: string;
        email: string;
      };
      createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ApiResponse {
    success: boolean;
    data?: {
      promoCodes: PromoCode[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
    message?: string;
  }