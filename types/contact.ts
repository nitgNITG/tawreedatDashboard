export interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  readed: boolean;
  response?: string;
}

export interface ContactState {
  contacts: Contact[];
  totalPages: number;
  totalCount: number;
}
