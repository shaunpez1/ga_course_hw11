$(document).ready(function(){

  // Setup Route
  Router({
    "/search-tracks" : searchTracks,
    "/saved-tracks": savedTracks

  }).init("/search-tracks");

  // Attempt to access token
  var tokenMatches = window.location.hash.match(/access_token=(.*)&token_type=*/);

  // If access token exists set into session cookie
  if(tokenMatches && tokenMatches[1]){
    var accessToken = tokenMatches[1];
    window
    .sessionStorage
    .setItem("spotify_access_token", accessToken);
  }

  // If logged in, change button to log out
  if(window.sessionStorage.getItem("spotify_access_token")){
    $(".login")
    .html("Logout")
    .attr("href", "/ga_course_hw11")
    .removeClass("btn-info")
    .addClass("btn-danger");
  }

  // If logout, remove cookie
  $(".login.btn-danger").on("click", function(){
    window.sessionStorage.removeItem("spotify_access_token");
  });

  function searchTracks(){
    // Generate Template
    var source = $("#track-template").html();
    var trackTemplate = Handlebars.compile(source);
    var $mainTemplate = $(".main-template");

    $(".search").show();

    // Clear Container
    $mainTemplate.html("");

    // Search listing of songs
    $(".search").on("submit", function(e){
      e.preventDefault();

      $.ajax({
        url: 'https://api.spotify.com/v1/search',
        type: "GET",
        data : {
          q : $(".form-control").val(),
          type : "track"
        },
        success : function(response) {

          // See if there are tracks
          if(response.tracks.items.length == 0){
            alert("There are no tracks under that search term");
          }else{
            // Loop through the tracks
            var tracks = [];

            response.tracks.items.forEach(function(track){
              var track = {
                id : track.id,
                title: track.name,
                artist : track.artists[0].name,
                clip: track.preview_url,
                album : track.album.name,
                image : track.album.images[0].url
              };
              tracks.push(track);
            });
            var trackList = {trackList : tracks};
            $mainTemplate.html(trackTemplate(trackList));

          }

        },
        error : function(){
          alert("Could not pull in track listing");
        }
      });
    });

    // Save a searched item
    $(document).on("click", ".save", function(e){
      e.preventDefault();
      var $save = $(this);

      if(!window.sessionStorage.getItem("spotify_access_token")){
        alert("Please login with spotify to save a track");
      }else{
        $.ajax({
          url: 'https://api.spotify.com/v1/me/tracks?ids=' + encodeURIComponent($(this).attr("data-id")),
          type: "PUT",
          headers: {
            'Authorization': 'Bearer ' + window.sessionStorage.getItem("spotify_access_token"),
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
          },
          success: function(response) {
            $save
              .removeClass("btn-success save")
              .addClass("btn-danger delete")
              .html("<span class=\"glyphicon glyphicon-remove margin-right-5\"></span>Delete Track ");
          },
          error : function(){
            alert("Error: track was not saved");
          }
        });
      }

    });
    // Delete a saved item
    $(document).on("click", ".delete", function(e){
      e.preventDefault();
      var $delete = $(this);
      $.ajax({
        url: 'https://api.spotify.com/v1/me/tracks?ids=' + encodeURIComponent($(this).attr("data-id")),
        type: "DELETE",
        headers: {
          'Authorization': 'Bearer ' + window.sessionStorage.getItem("spotify_access_token"),
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
        },
        success: function(response) {
          $delete
            .removeClass("btn-danger delete")
            .addClass("btn-success save")
            .html("<span class=\"glyphicon glyphicon-ok margin-right-5\"></span>Save Track ");
        },
        error : function(){
          alert("Error: track was not deleted");
        }
      });

    });
  }

  function savedTracks(){
    // Generate Template
    var source = $("#track-edit-template").html();
    var trackTemplate = Handlebars.compile(source);
    var $mainTemplate = $(".main-template");

    $(".search").hide();

    // Clear Template
    $mainTemplate.html();

    // List saved songs
    $.ajax({
      url: 'https://api.spotify.com/v1/me/tracks',
      type: "GET",
      headers: {
        'Authorization': 'Bearer ' + window.sessionStorage.getItem("spotify_access_token")
      },
      success : function(response) {
        // See if there are tracks
        if(response.items.length == 0){
          alert("There are no tracks under that search term");
        }else{
          $(".main-template").html("");

          var tracks = [];
          // Loop through the tracks
          response.items.forEach(function(item){
            var track = {
              id : item.track.id,
              title: item.track.name,
              artist : item.track.artists[0].name,
              clip: item.track.preview_url,
              album : item.track.album.name,
              image : item.track.album.images[0].url
            };
            tracks.push(track);
          });
          var trackList = {trackList : tracks};
          $(".main-template").html(trackTemplate(trackList));

        }

      },
      error : function(){
        alert("Could not pull in saved track listing, please go back to login into Spotify");
      }
    });

    // Save a searched item
    $(document).on("click", ".save", function(e){
      e.preventDefault();
      var $save = $(this);

      if(!window.sessionStorage.getItem("spotify_access_token")){
        alert("Please login with spotify to save a track");
      }else{
        $.ajax({
          url: 'https://api.spotify.com/v1/me/tracks?ids=' + encodeURIComponent($(this).attr("data-id")),
          type: "PUT",
          headers: {
            'Authorization': 'Bearer ' + window.sessionStorage.getItem("spotify_access_token"),
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
          },
          success: function(response) {
            $save
              .removeClass("btn-success save")
              .addClass("btn-danger delete")
              .html("<span class=\"glyphicon glyphicon-remove margin-right-5\"></span>Delete Track ");
          },
          error : function(){
            alert("Error: track was not saved");
          }
        });
      }

    });

    // Delete a saved item
    $(document).on("click", ".delete", function(e){
      e.preventDefault();
      var $delete = $(this);

      $.ajax({
        url: 'https://api.spotify.com/v1/me/tracks?ids=' + encodeURIComponent($(this).attr("data-id")),
        type: "DELETE",
        headers: {
          'Authorization': 'Bearer ' + window.sessionStorage.getItem("spotify_access_token"),
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
        },
        success: function(response) {
          $delete
            .removeClass("btn-danger delete")
            .addClass("btn-success save")
            .html("<span class=\"glyphicon glyphicon-ok margin-right-5\"></span>Save Track ");
        },
        error : function(){
          alert("Error: track was not deleted");
        }
      });

    });
  }


});
