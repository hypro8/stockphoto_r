import React, { useState, useEffect, useDebugValue, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Photo from "./Photo";

const clientID = `?client_id=${process.env.REACT_APP_ACCESS_KEY}`;
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;

function App() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const mounted = useRef(false);
  const [newImages, setNewImages] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`;
    const urlQuery = `&query=${query}`;

    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
    } else {
      url = `${mainUrl}${clientID}${urlPage}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      setPhotos((oldPhotos) => {
        if (query && page === 1) {
          return data.results;
        } else if (query) {
          return [...oldPhotos, ...data.results];
        } else {
          // fetch new page, and add it to photos array
          return [...oldPhotos, ...data];
        }
      });
      setNewImages(false);
      setLoading(false);
    } catch (error) {
      setNewImages(false);
      setLoading(false);
      console.log(error);
    }
  };

  // run on the inital render and following ones
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, [page]);

  // will not run on the intital render
  // start running in the following renders when parameter changes value
  useEffect(() => {
    if (!mounted.current) {
      // in the inital render, mounted change from false to true
      // and then return, so following wont execute.
      mounted.current = true;
      return;
    }
    // run from the second render:
    console.log("second render");
    // do nothing if not reached page bottom
    if (!newImages) return;
    // do nothing if loading
    if (loading) return;

    // increase page num if reached bottom and finished loading:
    setPage((oldPage) => oldPage + 1);
  }, [newImages]);

  // set event function:
  const event = () => {
    // every time if condition meets (scroll to bottom of page),
    // then call setNewImages()
    if (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - 10
    ) {
      setNewImages(true);
    }
  };

  // add eventListener in useEffect and call event function:
  useEffect(() => {
    window.addEventListener("scroll", event);
    return () => window.removeEventListener("scroll", event);
  }, []);

  // handle submit button click:
  const handleSubmit = (e) => {
    e.preventDefault();
    // do nothing if query is empty
    if (!query) return;
    if (page === 1) {
      fetchImages();
    }
    // if page is not default 1, then set it back to default
    // this is useful when loaded more than 1 page,
    // then entered new query to search.
    // setPage will trigger fetchImages().
    setPage(1);
  };

  return (
    <main>
      <section className="search">
        <form className="search-form">
          <input
            type="text"
            className="form-input"
            placeholder="search.."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="submit-btn"
            onClick={handleSubmit}
            // onClick={(e) => handleSubmit(e)}
          >
            <FaSearch />
          </button>
        </form>
      </section>
      <section className="photos">
        <div className="photos-center">
          {photos.map((item, index) => {
            return <Photo key={index} {...item} />;
          })}
        </div>
        {loading && <h2 className="loading">loading...</h2>}
      </section>
    </main>
  );
}

export default App;
