var urlParams = new URLSearchParams(window.location.search);

function displayResults(movies){
    $("#results-container").html("");
    $("#results-count").text("Matched " + movies.length + " results");
    for (var movie of movies) {
        var id = movie["id"];
        var result = $("<div class='search-result container pt-2 pb-4'>").attr("id", id);
        result.append(
            $("<div class='row'>").append(
                $("<div class='col-md-10 col-sm-12'>").append(
                    $("<div class='row'>").append(
                        $("<div class='col-md-12 h2 title'>").append(
                            $("<a>").text(movie["title"]).attr("href", "view/" + id)
                                .mark(query, {element: "span", className: "bg-warning"})
                        )
                    )
                ).append(
                    $("<div class='row'>").append(
                        $("<div class='col-md-12 pb-3'>").html(movie["review"].substring(0, 400) +
                            " ...(click title link for more)")
                    )
                ).append(
                    $("<div class='row'>").append(
                        $("<div class='col-md-3'>").text("Release: " + movie["release"])
                    ).append(function(){
                        var genres = [];
                        for (var item of movie["genre"])
                            genres.push(item["genre"]);

                        var res = $("<div class='col-md-9'>").text("Genre: ").append(
                            $("<span>").text(genres.join(", ")).mark(query, {element: "span", className: "bg-warning"})
                        );
                        return res
                    })
                )
            ).append(
                $("<div class='col-md-2 col-sm-12'>").append(
                    $("<div class='row'>").append(
                        $("<div class='col-md-12'>").append(
                            $("<img class='img-fluid img-thumbnail'>").attr({
                                alt: "Movie Poster" + movie["title"], src: movie["poster"]
                            })
                        )
                    )
                )
            )
        );
        $("#results-container").append(result);
    }
}

function getSearchResult() {
    query = $("#query-input").val();
    //urlParams.set("q", query);
    $.ajax({
        type: "GET",
        url: "search/" + query,
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: null,
        success: function(result){
            displayResults(result)
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error)
        }
    });
}

$(document).ready(function(){
    query = urlParams.get('q');
    $("#query-input").val(query);
    displayResults(movies);
    $("#search-button").click(function(){
        getSearchResult();
    })
    $("#query-input").on("keydown", function(e){
        if(e.which === 13) {
            e.preventDefault(); // so enter doesn't create newline but post instead
            getSearchResult();
        }
    })
});