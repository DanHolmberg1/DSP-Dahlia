// app/types.ts
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Public: undefined;
    Protected: undefined;
    Preferences: undefined;
  };
  export interface User {
    id: number;
    username: string;
    email: string;
    age: number;
    gender: string;
    show_men: boolean;
    show_women: boolean;
    show_other: boolean;
    min_age: number;
    max_age: number;
    interests?: number[];
    last_online?: string;
    is_online?: boolean;
  }
  
  export interface ServerPreferences {
    show_men: number;
    show_women: number;
    show_other: number;
    min_age: number;
    max_age: number;
    interests?: number[];
  }
  // Extend this as needed for your navigation structure