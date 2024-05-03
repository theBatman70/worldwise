import { useState, useEffect, createContext, useContext } from "react";
const BASE_URL = "https://worldwise-json-hazel.vercel.app";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState({});
  const [currentCity, setCurrentCity] = useState({});
  const [isLoading, setIsLoading] = useState();

  useEffect(function () {
    async function fetchCities() {
      try {
        setIsLoading(true);
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch {
        alert("There was an error loading data...");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCities();
  }, []);

  function getCity(id) {
    async function fetchCity() {
      try {
        setIsLoading(true);
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        setCurrentCity(data);
      } catch {
        alert("There was an error loading data...");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCity();
  }

  async function addCity(newCity) {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(data);
      setCities((cities) => [...cities, data]);
    } catch {
      alert("There was an error loading data...");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CitiesContext.Provider
      value={{ cities, isLoading, currentCity, getCity, addCity }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  return context;
}

export { useCities, CitiesProvider, BASE_URL };
