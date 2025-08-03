const BookInstance = require("../models/bookinstance");
const Book = require("../models/book")
const { body, validationResult } = require("express-validator");


// Display list of all BookInstances.
// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();
  
    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: allBookInstances,
    });
  };
  

// Display detail page for a specific BookInstance.
// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();
  
    if (bookInstance === null) {
      // No results.
      const err = new Error("Book copy not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("bookinstance_detail", {
      title: "Book:",
      bookinstance: bookInstance,
    });
  };
  
// Display detail page for a specific book.


  

// Display BookInstance create form on GET.
// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: allBooks,
    });
  };
  

// Handle BookInstance create on POST.
// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
  
    // Process request after validation and sanitization.
    async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a BookInstance object with escaped and trimmed data.
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });
  
      if (!errors.isEmpty()) {
        // There are errors.
        // Render form again with sanitized values and error messages.
        const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookinstance: bookInstance,
        });
        return;
      }
  
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    },
  ];
  

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
    try {
      const bookInstance = await BookInstance.findById(req.params.id).exec();
  
      if (bookInstance == null) {
        res.redirect("/catalog/books");
        return;
      }
  
      res.render("bookinstance_delete", {
        title: "Delete Book Instance",
        bookInstance,
      });
    } catch (err) {
      return next(err);
    }
  };
  

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
    res.redirect("/catalog/books");
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  const bookinstance = BookInstance.findById(req.params.id).exec();

  if ( bookinstance === null) {
    // No results.
    const err = new Error("Book Instance not found");
    err.status = 404;
    return next(err);
  }



  res.render("bookinstance_form", {
    title: "Update Book Instance",
    book_list: allBooks,
    bookinstance,
  });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Convert the genre to an array.
    (req, res, next) => {
     if (!Array.isArray(req.body.books)) {
       req.body.books =
         typeof req.body.books === "undefined" ? [] : [req.body.books];
     }
     next();
   },
   body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
   body("imprint", "Imprint must be specified")
     .trim()
     .isLength({ min: 1 })
     .escape(),
   body("status").escape(),
   body("due_back", "Invalid date")
     .optional({ values: "falsy" })
     .isISO8601()
     .toDate(),
 
   // Process request after validation and sanitization.
   async (req, res, next) => {
     // Extract the validation errors from a request.
     const errors = validationResult(req);
 
     // Create a BookInstance object with escaped and trimmed data.
     const bookInstance = new BookInstance({
       book: req.body.book,
       imprint: req.body.imprint,
       status: req.body.status,
       due_back: req.body.due_back,
     });
 
     if (!errors.isEmpty()) {
       // There are errors.
       // Render form again with sanitized values and error messages.
       const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
       // Mark our selected genres as checked.
     
       res.render("bookinstance_form", {
         title: "Update BookInstance",
         book_list: allBooks,
         selected_book: bookInstance.book._id,
         errors: errors.array(),
         bookinstance: bookInstance,
       });
       return;
     }

      // Data from form is valid. Update the record.
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {});
      // Redirect to book detail page.
      res.redirect(updatedBookInstance.url);
    },
 ];