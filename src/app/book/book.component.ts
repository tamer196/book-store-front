import { ListService, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { BookService, BookDto, bookTypeOptions, AuthorLookupDto } from '@proxy/books';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, Confirmation, DateAdapter } from '@abp/ng.theme.shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorService } from '@proxy/authors/author.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: DateAdapter }],
})
export class BookComponent implements OnInit {
  books: BookDto[] = [];
  filteredBooks: BookDto[] = [];
  paginatedBooks: BookDto[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  searchTerm = '';
  sortDirection = 'asc';
  currentSortField = '';

  form: FormGroup;
  selectedBook = {} as BookDto;
  isModalOpen = false;
  authors$: Observable<AuthorLookupDto[]>;

  constructor(
    private bookService: BookService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    public readonly list: ListService,
    private authorService: AuthorService,
  ) { 
     this.authors$ = bookService.getAuthorLookup().pipe(map((r) => r.items));
  }

  ngOnInit() {
    this.loadBooks();
    
  }
  bookTypes = bookTypeOptions;

  loadBooks() {
    const requestParams: PagedAndSortedResultRequestDto = {
      maxResultCount: 10,  // Number of items to load per page
      skipCount: (this.currentPage - 1) * 10,  // Skipping based on the current page
      sorting: this.currentSortField ? `${this.currentSortField} ${this.sortDirection}` : undefined
    };
  
    this.bookService.getList(requestParams).subscribe(response => {
      this.books = response.items;
      this.filteredBooks = [...this.books];
      this.updatePagination();
    });
  }
  

  filterBooks() {
    this.filteredBooks = this.books.filter(book =>
      book.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }

  sortData(field: string) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentSortField = field;

    this.filteredBooks.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (this.sortDirection === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedBooks = this.filteredBooks.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  createBook() {
    this.selectedBook = {} as BookDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editBook(id: string) {
    this.bookService.get(id).subscribe(book => {
      this.selectedBook = book;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  buildForm() {
    this.form = this.fb.group({
      authorId: [this.selectedBook.authorId || null, Validators.required],
      name: [this.selectedBook.name || null, Validators.required],
      type: [this.selectedBook.type || null, Validators.required],
      publishDate: [
        this.selectedBook.publishDate ? new Date(this.selectedBook.publishDate) : null,
        Validators.required,
      ],
      price: [this.selectedBook.price || null, Validators.required],
    });
  }

  save() {
    debugger
    if (this.form.invalid) return;

    const request = this.selectedBook.id
      ? this.bookService.update(this.selectedBook.id, this.form.value)
      : this.bookService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.loadBooks();
    });
  }

  deleteBook(id: string) {
    this.confirmation.warn('::AreYouSureToDelete', 'AbpAccount::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.bookService.delete(id).subscribe(() => this.loadBooks());
      }
    });
  }
}
