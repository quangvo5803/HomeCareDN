import SearchContext from "../context/SearchContext";
import { useContext } from "react";

export const useSearch = () => useContext(SearchContext);
