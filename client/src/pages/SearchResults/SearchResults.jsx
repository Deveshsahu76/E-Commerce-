import { useSearchParams } from "react-router-dom";
import Products from "../Products/Products";

const SearchResults = () => {
  const [params] = useSearchParams();

  return (
    <div>
      <Products initialSearch={params.get("q") || ""} />
    </div>
  );
};

export default SearchResults;