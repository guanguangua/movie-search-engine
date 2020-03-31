from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
import copy
import json

app = Flask(__name__)

with open("static/data.json") as f:
    data = json.load(f)

curr_id = data[-1]["id"] + 1


#  not used yet
def filterDeletedField(movie):
    movie = copy.deepcopy(movie)
    movie["genre"] = [x for x in movie["genre"] if not x["marked_as_deleted"]]
    return movie


@app.route('/', methods=['GET'])
def index():
    movies = data[-10:][::-1]
    # movies = copy.deepcopy(movies)
    # movies = [filterDeletedField(movie) for movie in movies]
    return render_template("index.html", movies=movies)


@app.route('/view/<id>', methods=['GET'])
def view(id=None):
    if not id:
        return jsonify({"msg": "Please provide ID of the movie"}), 400
    for movie in data:
        if movie["deleted"]:
            continue
        if movie["id"] == int(id):
            return render_template("view.html", movie=movie)  # filterDeletedField(movie)
    return jsonify({"msg": "Movie not found"}), 404


@app.route('/edit/<id>', methods=['PUT'])
def edit(id=None):
    if not id:
        return jsonify({"msg": "Please provide ID of the movie"}), 400
    if request.method == "PUT":
        for movie in data:
            if movie["deleted"]:
                continue
            if movie["id"] == int(id):
                user_data = request.get_json()
                movie["review"] = user_data.get("review", "")
                movie["release"] = user_data.get("release", "")
                movie["genre"] = user_data.get("genre", [])
                return jsonify({"msg": "Successfully updated"}), 200
    return jsonify({"msg": "Movie not found"}), 404


@app.route('/create', methods=['GET', 'POST'])
def create():
    global curr_id, data
    if request.method == 'GET':
        return render_template('create.html')
    elif request.method == "POST":
        user_data = request.get_json()
        user_data["id"] = curr_id
        user_data["genre"] = [{"genre": x.strip(), "marked_as_deleted": False} for x in user_data["genre"]]
        user_data["deleted"] = False
        curr_id += 1
        data.append(user_data)
        return jsonify(id=curr_id - 1)


@app.route('/search/<query>', methods=['GET'])
def _search(query=None):
    res = []
    for movie in data:
        if movie["deleted"]:
            continue
        if query.lower() in movie["title"].lower() \
                or query.lower() in [x["genre"].lower() for x in movie["genre"]]:
            res.append(movie)  # filterDeletedField(movie)
    return jsonify(res[::-1])


# search with query param
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get("q", None)
    if not query:
        rsp_txt = json.dumps({"msg": "Invalid argument"})
        return Response(rsp_txt, status=400, content_type="json/application")

    res = []
    for movie in data:
        if movie["deleted"]:
            continue
        if query.lower() in movie["title"].lower() \
                or query.lower() in [x["genre"].lower() for x in movie["genre"]]:
            res.append(movie)
    # res = [filterDeletedField(movie) for movie in res]
    return render_template("search.html", movies=res[::-1])


@app.route('/delete/<id>', methods=['DELETE', 'PUT'])
def delete(id=None):
    if not id:
        return jsonify({"msg": "ID is empty"}), 400
    id = int(id)
    for movie in data:
        if movie["id"] == id:
            if request.method == "PUT":
                movie["deleted"] = False
                return jsonify({"msg": "Successfully undo delete"}), 200
            elif request.method == "DELETE":
                movie["deleted"] = True
                return jsonify({"msg": "Successfully deleted"}), 200
    return jsonify({"msg": "ID not found"}), 404


@app.route('/delete_genre/<movie_id>/<genre_idx>')
def delete_genre(movie_id, genre_idx):
    if not movie_id or not genre_idx:
        return jsonify({"msg": "ID is empty"}), 400
    movie_id, genre_idx = int(movie_id), int(genre_idx)
    for movie in data:
        if movie["id"] == movie_id:
            if request.method == "PUT":
                movie["mark_as_deleted"][genre_idx] = False
                return jsonify({"msg": "Successfully undo delete"}), 200
            elif request.method == "DELETE":
                movie["mark_as_deleted"][genre_idx] = True
                return jsonify({"msg": "Successfully deleted"}), 200
    return jsonify({"msg": "ID not found"}), 404


if __name__ == '__main__':
    app.run(debug=True)
