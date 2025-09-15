export interface SubAdmin {
    id: string;
    name: string;
    email: string;
    password?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }