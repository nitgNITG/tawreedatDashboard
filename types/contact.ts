export interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string;
  read: boolean;
  read_at: string;
  response?: string;
}

export interface ContactState {
  contacts: Contact[];
  totalPages: number;
  totalCount: number;
}
