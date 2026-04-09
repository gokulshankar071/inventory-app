import { useState } from "react";
import "./App.css";

function App() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError("Min price cannot be greater than max price");
      return;
    }

    try {
      const params = new URLSearchParams({
        q,
        category,
        minPrice,
        maxPrice,
      });

      const res = await fetch(
        `https://inventory-app-nv4s.onrender.com/search?${params}`,
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Error fetching data");
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🔍 Inventory Search</h1>

        <div className="inputs">
          <input
            placeholder="Search product..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
          </select>

          <div className="price-range">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <button onClick={handleSearch}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}

        {results.length === 0 ? (
          <p className="no-data">No results found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.category}</td>
                    <td>₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
