const state = {
  library: JSON.parse(localStorage.getItem("library")) || [],
  downloads: JSON.parse(localStorage.getItem("downloads")) || [],
  books: [], // Will be populated from data.js
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
};

const booksGrid = document.getElementById("booksGrid");
const libraryGrid = document.getElementById("libraryGrid");
const downloadGrid = document.getElementById("downloadGrid");
const searchInput = document.getElementById("searchInput");
const categoryTags = document.querySelectorAll(".category-tag");
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const libraryBadge = document.getElementById("libraryBadge");
const downloadBadge = document.getElementById("downloadBadge");
const clearLibraryBtn = document.getElementById("clearLibrary");
const clearDownloadsBtn = document.getElementById("clearDownloads");
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const closeLogin = document.getElementById("closeLogin");
const mainContent = document.getElementById("mainContent");
const bottomNav = document.querySelector(".bottom-nav");

async function init() {
  if (!state.isLoggedIn) {
    showLoginModal();
  } else {
    showMainContent();
  }

  await fetchBooks();
  displayBooks(state.books);
  updateLibrary();
  updateDownloads();
  updateBadges();
  showSection("discover");
}

function showLoginModal() {
  loginModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function hideLoginModal() {
  loginModal.style.display = "none";
  document.body.style.overflow = "auto";
}

function showMainContent() {
  mainContent.style.display = "block";
  bottomNav.style.display = "flex";
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "ebook" && password === "123") {
    state.isLoggedIn = true;
    localStorage.setItem("isLoggedIn", "true");
    hideLoginModal();
    showMainContent();
    showToast("Login successful!", "success");
  } else {
    showToast("Invalid credentials! Try username: ebook, password: 123", "danger");
  }
}

async function fetchBooks() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    state.books = bookData;
  } catch (error) {
    console.error("Error fetching books:", error);
    showToast("Failed to load books. Using demo data.", "danger");

        state.books = [
      {
        id: 1,
        title: "Sample Book",
        author: "Demo Author",
        category: "fiction",
        cover: "",
        rating: 4.0,
        pages: 200,
        content: "<p>This is sample content that would be loaded from the API.</p>",
      },
    ];
  }
}

function displayBooks(booksToDisplay) {
  booksGrid.innerHTML = "";

  if (booksToDisplay.length === 0) {
    booksGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <h3>No Books Found</h3>
        <p>Try adjusting your search or category filter</p>
      </div>
    `;
    return;
  }

  booksToDisplay.forEach((book) => {
    const bookCard = createBookCard(book, true);
    booksGrid.appendChild(bookCard);
  });
}

function displayLibraryBooks() {
  libraryGrid.innerHTML = "";

  if (state.library.length === 0) {
    libraryGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bookmark"></i>
        <h3>Your Library is Empty</h3>
        <p>Add books from the Discover section to save them here</p>
      </div>
    `;
    return;
  }

  state.library.forEach((bookId) => {
    const book = state.books.find((b) => b.id == bookId);
    if (book) {
      const bookCard = createBookCard(book, false);
      libraryGrid.appendChild(bookCard);
    }
  });
}

function displayDownloadedBooks() {
  downloadGrid.innerHTML = "";

  if (state.downloads.length === 0) {
    downloadGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-download"></i>
        <h3>No Downloads Yet</h3>
        <p>Download books from the Discover section to save them here</p>
      </div>
    `;
    return;
  }

  state.downloads.forEach((bookId) => {
    const book = state.books.find((b) => b.id == bookId);
    if (book) {
      const bookCard = createBookCard(book, false);
      downloadGrid.appendChild(bookCard);
    }
  });
}

function createBookCard(book, showActions) {
  const bookCard = document.createElement("div");
  bookCard.className = "book-card";
  bookCard.dataset.id = book.id;

  const coverHtml = book.cover
    ? `<img src="${book.cover}" class="book-cover" alt="${book.title}" onerror="this.onerror=null;this.src='';this.parentNode.innerHTML='<i class=\\'fas fa-book book-cover-placeholder\\'></i>'">`
    : `<i class="fas fa-book book-cover-placeholder"></i>`;

  const actionsHtml = showActions
    ? `
      <div class="book-actions">
        <button class="action-btn read-btn" data-id="${book.id}" title="Read">
          <i class="fas fa-book-open"></i>
        </button>
        <button class="action-btn library-btn" data-id="${book.id}" title="Save to Library">
          <i class="fas fa-bookmark"></i>
        </button>
        <button class="action-btn download-btn" data-id="${book.id}" title="Download">
          <i class="fas fa-download"></i>
        </button>
      </div>`
    : `
      <div class="book-actions">
        <button class="action-btn read-btn" data-id="${book.id}" title="Read">
          <i class="fas fa-book-open"></i>
        </button>
      </div>`;

  bookCard.innerHTML = `
    <div class="book-cover-container">
      ${coverHtml}
    </div>
    <div class="book-info">
      <div class="book-title">${book.title}</div>
      <div class="book-author">${book.author}</div>
      <div class="book-meta">
        <span class="rating">${book.rating} ★</span>
        <span>${book.pages} pages</span>
      </div>
    </div>
    ${actionsHtml}
  `;

  return bookCard;
}

function addToLibrary(bookId) {
  if (!state.library.includes(bookId)) {
    state.library.push(bookId);
    localStorage.setItem("library", JSON.stringify(state.library));
    updateLibrary();
    updateBadges();
    showToast("Book added to your library!", "success");
  } else {
    showToast("This book is already in your library!", "info");
  }
}

function downloadBook(bookId) {
  if (!state.downloads.includes(bookId)) {
    state.downloads.push(bookId);
    localStorage.setItem("downloads", JSON.stringify(state.downloads));
    updateDownloads();
    updateBadges();
    showToast("Book downloaded successfully!", "success");
  } else {
    showToast("This book is already downloaded!", "info");
  }
}

function updateLibrary() {
  displayLibraryBooks();
}

function updateDownloads() {
  displayDownloadedBooks();
}

function updateBadges() {
  libraryBadge.textContent = state.library.length;
  downloadBadge.textContent = state.downloads.length;
}

function clearLibrary() {
  state.library = [];
  localStorage.setItem("library", JSON.stringify(state.library));
  updateLibrary();
  updateBadges();
  showToast("Library cleared successfully", "success");
}

function clearDownloads() {
  state.downloads = [];
  localStorage.setItem("downloads", JSON.stringify(state.downloads));
  updateDownloads();
  updateBadges();
  showToast("Downloads cleared successfully", "success");
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

function openReader(bookId) {
  const book = state.books.find((b) => b.id == bookId);
  if (book) {
    const readerWindow = window.open("", "_blank");
    
      const readerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${book.title} | fRee-eBook</title>
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          h1 {
            color: #4361ee;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6c757d;
            font-style: italic;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
          }
          h3 {
            color: #4361ee;
            margin: 25px 0 15px;
          }
          p {
            margin-bottom: 20px;
          }
          .close-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #000;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body>
        <button class="close-btn" onclick="window.close()">×</button>
        <h1>${book.title}</h1>
        <div class="subtitle">by ${book.author}</div>
        <div class="book-content">
          ${book.content}
        </div>
      </body>
      </html>
    `;
    
    readerWindow.document.open();
    readerWindow.document.write(readerHTML);
    readerWindow.document.close();
  }
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active");
    if (section.id === `${sectionId}Section`) {
      section.classList.add("active");
    }
  });

  navItems.forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.section === sectionId) {
      item.classList.add("active");
    }
  });
}

document.addEventListener("click", function (e) {
  if (
    e.target.classList.contains("read-btn") ||
    e.target.closest(".read-btn")
  ) {
    const btn = e.target.classList.contains("read-btn")
      ? e.target
      : e.target.closest(".read-btn");
    openReader(parseInt(btn.dataset.id));
  }


  if (
    e.target.classList.contains("library-btn") ||
    e.target.closest(".library-btn")
  ) {
    const btn = e.target.classList.contains("library-btn")
      ? e.target
      : e.target.closest(".library-btn");
    addToLibrary(parseInt(btn.dataset.id));
  }

  if (
    e.target.classList.contains("download-btn") ||
    e.target.closest(".download-btn")
  ) {
    const btn = e.target.classList.contains("download-btn")
      ? e.target
      : e.target.closest(".download-btn");
    downloadBook(parseInt(btn.dataset.id));
  }
});

categoryTags.forEach((tag) => {
  tag.addEventListener("click", function () {
    categoryTags.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");

    const category = this.dataset.category;
    if (category === "all") {
      displayBooks(state.books);
    } else {
      const filteredBooks = state.books.filter(
        (book) => book.category === category
      );
      displayBooks(filteredBooks);
    }
  });
});

searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();

  if (searchTerm.length > 0) {
    const filteredBooks = state.books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );
    displayBooks(filteredBooks);
  } else {
    const activeTag = document.querySelector(".category-tag.active");
    if (activeTag && activeTag.dataset.category !== "all") {
      const category = activeTag.dataset.category;
      const filteredBooks = state.books.filter(
        (book) => book.category === category
      );
      displayBooks(filteredBooks);
    } else {
      displayBooks(state.books);
    }
  }
});

navItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(this.dataset.section);
  });
});

clearLibraryBtn.addEventListener("click", clearLibrary);
clearDownloadsBtn.addEventListener("click", clearDownloads);

loginForm.addEventListener("submit", handleLogin);

closeLogin.addEventListener("click", hideLoginModal);

window.addEventListener("click", function (e) {
  if (e.target === loginModal) {
    hideLoginModal();
  }
});


init();


