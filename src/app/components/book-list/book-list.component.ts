import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  searchForm: FormGroup;
  searchType: string = 'title';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private bookService: BookService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.error = null;
    this.bookService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load books. Please try again later.';
        this.loading = false;
        console.error('Error loading books:', err);
      }
    });
  }

  search(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (!searchTerm) {
      this.loadBooks();
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.searchType === 'title') {
      this.bookService.searchBooksByTitle(searchTerm).subscribe({
        next: (data) => {
          this.books = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Search failed. Please try again.';
          this.loading = false;
          console.error('Error searching books by title:', err);
        }
      });
    } else if (this.searchType === 'author') {
      this.bookService.searchBooksByAuthor(searchTerm).subscribe({
        next: (data) => {
          this.books = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Search failed. Please try again.';
          this.loading = false;
          console.error('Error searching books by author:', err);
        }
      });
    } else if (this.searchType === 'isbn') {
      this.bookService.getBookByIsbn(searchTerm).subscribe({
        next: (data) => {
          this.books = [data];
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.books = [];
            this.error = 'No book found with this ISBN.';
          } else {
            this.error = 'Search failed. Please try again.';
          }
          this.loading = false;
          console.error('Error searching book by ISBN:', err);
        }
      });
    }
  }

  setSearchType(type: string): void {
    this.searchType = type;
  }

  editBook(id: number): void {
    this.router.navigate(['/books/edit', id]);
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.books = this.books.filter(book => book.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete book. Please try again.';
          console.error('Error deleting book:', err);
        }
      });
    }
  }

  addNewBook(): void {
    this.router.navigate(['/books/new']);
  }
}
