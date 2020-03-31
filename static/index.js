function displayResults(movies){
    $("#cards-container").html("");
    for (var movie of movies) {
        var id = movie["id"], title = movie["title"], review = movie["review"], poster = movie["poster"];
        var result = $("<div>").addClass("card").append(
            $("<a>").attr("href", "/view/" + id).append(
                $("<img>").addClass("card-img-top").attr("src", poster).attr("alt", "Movie Poster: " + title)
            )
        ).append(
            $("<div>").addClass("card-body").append(
                $("<h5>").addClass("card-title").text(title)
            ).append(
                $("<p>").addClass("card-text").html(review.substring(0, 160) + " ...").append(
                     $("<a>").text("(click for more)").attr("href", "/view/" + id)
                )
            )
        )
        $("#cards-container").append(result);
    }
}

$(document).ready(function(){
    displayResults(movies);
});