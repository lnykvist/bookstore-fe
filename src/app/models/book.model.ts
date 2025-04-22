export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  isbn: string;
  publicationDate: string; // Will be converted to/from LocalDate
  price: number;
  inStock: boolean;
}
