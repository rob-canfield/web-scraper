$(document).ready(function () {
  fetch('/reviews')
    .then(res => res.json())
    .then(data => data.forEach(item => {
      $("#reviews").prepend(
        `<div class="card">
      <img class="album-art" src="${item.image}" alt="${item.album} album art">
      <p class="published-date">${item.date}</p>
      <h2 class="artist">${item.artist}</h2>
      <h4 class="album-title">${item.album}</h4>
      <h6 class="genre">${item.genre}</h6>
      <p id="author">${item.author}</p>
      <a href="${item.link}" target="_blank"><button class="read-article">Read Article</button></a>
      <button class="make-notes" data-id="${item._id}">Make Notes</button>
      </div>`
      );
    }))
    .catch(error => console.log(error));



  $(document).on("click", ".make-notes", function () {

    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    
   

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/reviews/" + thisId
    })
      // With that done, add the note information to the page
      .then(function (data) {
        console.log(data);
        // The title of the article
        $("#notes").append(
          `<div class="note-field">
            <h2> ${data.album} </h2>
            <label for="titleinput">Title</label>
            <input id="titleinput" name="title">
            <textarea id="bodyinput" name="body"></textarea>
            <button data-id="${data._id}" id="savenote">Save Note</button>
          </div>`
        );
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/reviews/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val().trim(),
        // Value taken from note textarea
        body: $("#bodyinput").val().trim()
      }
    })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
});