export interface Category {
    id: number;
    name: string;
    imageUrl: string;
  }
  
  export interface TableProps {
    data: Category[];
    currentPage: number;
    itemsPerPage: number;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onView?: (id: number) => void;
  }
  
  export interface ActionIconsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    className?: string;
  }