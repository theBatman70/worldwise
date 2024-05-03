// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useReducer, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useUrlPosition } from "../hooks/useUrlPosition";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [lat, lng] = useUrlPosition();
  const { addCity, isLoading } = useCities();
  const navigate = useNavigate();

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);

  function reducer(state, action) {
    switch (action.type) {
      case "setLocation":
        const location = action.payload;
        return {
          cityName: location.cityName || location.locality || "",
          country: location.countryName,
          emoji: convertToEmoji(location.countryCode),
          date: new Date(),
        };
      case "editCityName":
        return { ...state, cityName: action.payload };
      case "setDate":
        return { ...state, date: action.payload };
      case "setNotes":
        return { ...state, notes: action.payload };
      case "error":
        return { error: action.payload };
    }
  }

  const [state, dispatch] = useReducer(reducer, {});
  const { cityName, emoji, country, date, notes, error } = state;

  useEffect(
    function () {
      async function fetchCity() {
        try {
          setIsLoadingGeocoding(true);
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          console.log(data, data.countryCode);
          if (!data.countryCode) {
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else 😉"
            );
          }
          dispatch({ type: "setLocation", payload: data });
        } catch (err) {
          dispatch({ type: "error", payload: err.message });
        } finally {
          setIsLoadingGeocoding(false);
        }
      }
      if (lat && lng) {
        fetchCity();
      }
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await addCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (!lat && !lng) return <Message message="Start by clicking on the map" />;

  if (error) return <Message message={error} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) =>
            dispatch({ type: "editCityName", payload: e.target.value })
          }
          value={cityName}
        />
        <span className={styles.flag}>{state.emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <ReactDatePicker
          id="date"
          onChange={(date) => dispatch({ type: "setDate", payload: date })}
          selected={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) =>
            dispatch({ type: "setNotes", payload: e.target.value })
          }
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary" onClick={handleSubmit}>
          Add
        </Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
