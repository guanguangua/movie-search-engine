function submitChange(data, success) {
    $.ajax({
        type: "PUT",
        url: "../edit/" + data["id"],
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify(data),
        success: success,
        error: function(request, status, error){
            console.log("Error");
            console.log(request);
            console.log(status);
            console.log(error)
        }
    })
}

function renderGenreList(movie) {
    var res = $("<div class='d-inline-block' id='genre-list'>");
    for (var i = 0; i < movie["genre"].length; ++i) {
        var genre = movie["genre"][i];
        if (genre["marked_as_deleted"]) continue;
        var element = $("<div class='d-inline'>").append(
            $("<span class='badge badge-light px-1'>").attr("id", "genre-" + i).text(genre["genre"]).append(
                $("<i class='fas fa-trash-alt pl-1'>").attr("id", "del-genre-" + i).click(function(){
                    var idx = parseInt($(this).attr("id").split("-")[2]);
                    movie["genre"][idx]["marked_as_deleted"] = true;
                    submitChange(movie, function(){
                        $("#genre-" + idx).hide();
                        $("#undo-del-" + idx).show();
                    })
                })
            ),
            $("<button class='badge badge-secondary px-1 mx-1'>").text("Undo")
                .attr("id", "undo-del-" + i).click(function(){
                    var idx = parseInt($(this).attr("id").split("-")[2]);
                    movie["genre"][idx]["marked_as_deleted"] = false;
                    submitChange(movie, function(){
                        $("#genre-" + idx).show();
                        $("#undo-del-" + idx).hide();
                    })
            }).hide()
        );
        res.append(element);
    }
    // res.append(
    //     $("<span class='badge badge-light px-1'>").append(
    //         $("<i class='fas fa-plus-circle'>")
    //     )
    // );
    return res
}

function displayResult(movie) {
    $("#results-container").html("");
    var id = movie["id"];
    var result = $("<div class='search-result container pt-2 pb-4'>").attr("id", id);
    result.append(
        $("<div class='row h2 title pb-1'>").append(
            $("<div class='col-md-10'>").text(movie["title"])
        ).append(
            $("<div class='col-md-2'>").append(
                $("<button class='btn btn-danger float-right' id='delete-btn'>").text("Delete Post"),
                $("<button class='btn btn-secondary float-right' id='undo-delete-btn'>").text("Undo Delete").hide()
            )
        )
    ).append(
        $("<div class='row pb-2'>").append(
            $("<div class='col-md-12'>").append(
                $("<p class='d-inline' id='review'>").text(movie["review"]),
                $("<i>").addClass("fas fa-edit float-right align-middle").attr("id", "review-edit") // review edit icon
            )
        )
    ).append(
        $("<div class='row pb-3'>").append(
            $("<div class='col-md-9'>").text("Genre: ").append(renderGenreList(movie))
        ).append(
            $("<div class='col-md-3'>").text("Release: ").append(
                $("<span id='release'>").text(movie["release"]),
                $("<i>").addClass("fas fa-edit float-right align-middle").attr("id", "release-edit") // release edit icon
            )
        )
    ).append(
        $("<div class='row pb-3' id='control-btns'>").append(
            $("<div class='col-md-12'>").append(
                $("<button class='btn btn-primary float-right ml-1' id='submit-btn'>").text("Submit"),
                $("<button class='btn btn-secondary float-right mr-1' id='discard-btn'>").text("Discard changes")
            )
        ).hide()
    ).append(
        $("<div class='row mb-2'>").append(
            $("<div class='col-md-12'>").append(
                $("<div class='embed-responsive embed-responsive-16by9'>").html(
                    "<iframe class='embed-responsive-item' src=" + movie["trailer"] + " " +
                    "frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' " +
                    "allowfullscreen " + "alt=" + "Movie Trailer" + "></iframe>"
                )
            )
        )
    ).append(
        $("<div class='row'>").append(
            $("<div class='col-md-12'>").append(
                $("<div>").text("Poster:"),
                $("<img class='img-fluid img-thumbnail'>").attr({alt: "Movie Poster", src: movie["poster"]})
            )
        )
    );
    $("#results-container").append(result);
}

function renderEditable(movie) {
    $("#review").html(movie["review"]);
    $("#release").text(movie["release"]);
}

function addEventListeners(){
    $("#delete-btn").click(function(){
        $.ajax({
            type: "DELETE",
            url: "../delete/" + id,
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : null,
            success: function(result){
                $("#delete-btn").hide();
                $("#undo-delete-btn").show();
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error)
            }
        })
    });
    $("#undo-delete-btn").click(function(){
        $.ajax({
            type: "PUT",
            url: "../delete/" + id,
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : null,
            success: function(result){
                $("#undo-delete-btn").hide();
                $("#delete-btn").show();
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error)
            }
        })
    });

    // hide the edit button when editable is focused
    $("#review-edit").click(function(){
        $("#review").attr("contenteditable", "true").focusin(function(event){
            $("#review-edit").hide()
        }).focusout(function(event){
            $("#review-edit").show();
            $("#review").attr("contenteditable", "false")
        }).focus()
    });
    $("#release-edit").click(function(){
        $("#release").attr("contenteditable", "true").focusin(function(event){
            $("#release-edit").hide()
        }).focusout(function(event){
            $("#release-edit").show();
            $("#release").attr("contenteditable", "false")
        }).focus()
    });

    $(".fas.fa-edit").click(function(){
        $("#control-btns").show();
    });

    // submit and discard change button action listener
    $("#submit-btn").click(function(){
        var review = $("#review").html(), release = $("#release").text();
        movie["review"] = review;
        movie["release"] = release;
        $.ajax({
            type: "PUT",
            url: "../edit/" + id,
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(movie),
            success: function(result){
                renderEditable(movie);
                $("#control-btns").hide()
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error)
            }
        })
    });
    $("#discard-btn").click(function(){
        renderEditable(movie);
        $("#control-btns").hide()
    });
}


$(document).ready(function(){
    id = movie["id"];
    displayResult(movie);
    addEventListeners();
});