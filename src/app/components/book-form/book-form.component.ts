import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode = false;
  bookId?: number;
  loading = false;
  submitted = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookForm = this.formBuilder.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      description: [''],
      isbn: ['', Validators.required],
      publicationDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      inStock: [true]
    });
  }

  ngOnInit(): void {
    this.bookId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.bookId;

    if (this.isEditMode) {
      this.loading = true;
      this.bookService.getBookById(this.bookId!).subscribe({
        next: (book) => {
          // Format the date to YYYY-MM-DD for the date input
          const formattedDate = new Date(book.publicationDate)
            .toISOString()
            .split('T')[0];
          
          this.bookForm.patchValue({
            ...book,
            publicationDate: formattedDate
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load book details. Please try again.';
          this.loading = false;
          console.error('Error loading book:', err);
          
          // Navigate back to the list if the book doesn't exist
          if (err.status === 404) {
            this.router.navigate(['/books']);
          }
        }
      });
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.bookForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.bookForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const bookData: Book = {
      ...this.bookForm.value
    };

    if (this.isEditMode) {
      this.bookService.updateBook(this.bookId!, bookData).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.error = 'Failed to update book. Please try again.';
          this.loading = false;
          console.error('Error updating book:', err);
        }
      });
    } else {
      this.bookService.createBook(bookData).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.error = 'Failed to create book. Please try again.';
          this.loading = false;
          console.error('Error creating book:', err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/books']);
  }
}