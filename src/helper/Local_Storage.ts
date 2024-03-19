import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useLocalStorageState = <T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  // Custom hook for managing state persisted in local storage.
  const [value, setValue] = useState(() => {
    return parseLocalStorageItem<T>(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const parseLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  // Helper function for parsing items from local storage.
  const item = localStorage.getItem(key);
  if (item && item !== null && item !== "undefined") {
    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error("Error parsing localStorage item:", error);
    }
  }
  return defaultValue;
};

export const localStorageSpace = (): number => {
  var allStrings = "";
  for (var key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      allStrings += window.localStorage[key];
    }
  }
  return allStrings ? 3 + (allStrings.length * 16) / (8 * 1024) : 0;
};
