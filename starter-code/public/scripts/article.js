'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are to-do comment lines inside of the method, describe what the following code is doing (down to the next to-do) and change the to-do into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - loadAll is a method on the Article object that will be used to load all of the articles
 * - Inputs: takes in rows as the argument, which is referencing each instance of an Article
 * - Outputs: will sort the rows by date, then add them to the Article.all array that was created on line 12
 */
Article.loadAll = function(rows) {
  // DONE: describe what the following code is doing
  // This function is comparing all of the articles, two at a time. They are referred to as 'a' and 'b'. Each time the data is sorted, two articles are compared and sorted by the date on which they were published. By going through all of the data, the resulting information will be ordered by publication date. Date() is a built-in method and it is being passed the publication date of a and of b to format them with minutes, seconds, ms, etc., then comparing them.
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: describe what the following code is doing
  // this method on rows is a function that takes in ele as the argument. It is going to take each instance of an Article and push it into the Article.all array.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Overall, this .fetchAll method is checking to see if there is any data in the database and based on that, either retrieving it from the database or use the hackerIpsum.json as the data
 * - Inputs: the method takes in an argument of "callback" which is used when initializing the page (via articleView.initIndexPage in index.html)
 * - Outputs: the output is calling the articleView.initIndexPage in index.html using either the records already in the database, or the data from hackerIpsum.json
 */
Article.fetchAll = function(callback) {
  // DONE: describe what the following code is doing
  // this is using the jquery selector $ and using the .get method to specifically request information from the /articles filepath (url) from the server
  $.get('/articles')
  // DONE: describe what the following code is doing
  // after the articles have been retrieved from the server, using .then can dictate what should happen next. in this case, the next step is to fun a function that takes in the argument of 'results' which referrs to records from the database
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: describe what the following code is doing
        // if there are records already in the database, the loadAll method will be called on the Article to load all of the stored results into the browswer. The callback function is also called on line 85.
        Article.loadAll(results);
        callback(); //this is going to call the fetchAll function from index.html
      } else { // if NO records exist in the DB
        // DONE: describe what the following code is doing
        // this line is going to load the JSON data from the server, specifically the information from the hackerIpsum.json file. Because this is part of the else condition, it will only occur if the records do not already exist in the database. Then it will take the data from the .json file and run through them one at a time using the forEach method. This method will assign the article variable to a new instance of an Article and add it to the database.
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: describe what the following code is doing
        // this line is calling the fetchAll method which is making sure the functions run in the correct asynchronous order. The is going to initialize the articleView.initIndexPage in index.html
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: describe what the following code is doing
        // .catch is a method that runs with the .then method fails. in this case, it is a function that takes in the argument "err" and results in a console message. because it is .error and not .log it will be displayed as an error message in red text with a pink background instead of a plain old console.log message
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - The purpose of this method is to truncate the table by removing all of the data from the /articles filepath
 * - Like the fetchAll method, this also takes in callback as the argument to initialize the page
 * - Outputs: nothing is actually being sent out when the table is truncated, but the result of this function is loading the page again with the table information completely removed
 */
Article.truncateTable = function(callback) {
  // TODO: describe what the following code is doing
  // this is an ajax request which is sending a request to the filepath of /articles and using the method of DELETE, which is going to remove all of the data from the table
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: describe what the following code is doing
  // after the ajax request, this is going to print the data to the console and initialize the index page again to reflect the changes -- in other words, reload the page to show that the table has been deleted. The "if" part of it will only reload the page if the page had already been loaded.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method is going to insert the information from the Article constructor and post (insert) it into the table
 * - Inputs: it takes in the argument of callback
 * - Outputs: it inserts the data onto the table then loads the page again
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: describe what the following code is doing
  // this is going to insert the specified information into the table located at the /articles filepath. In this case, the specific information to be added is the author, authorURL, body, category, publication date, and title. They are being pulled from each instance of the Article object by referencing each one with 'this.' which will run through all of the Articles
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: describe what the following code is doing
  // once the information has been inserted into the table using the $.post method, the data will be logged to the console and the page will reload if it was already loaded by calling the callback() method
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.deleteRecord = function(callback) {
  // TODO: describe what the following code is doing
  // this is another ajax request. it is going to specific
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // TODO: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.updateRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // TODO: describe what this object is doing
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // TODO: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
