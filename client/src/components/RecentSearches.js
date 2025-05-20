import React from "react";
import { Link } from "react-router-dom";
import "../styles/RecentSearches.css";

const RecentSearches = ({ searches }) => {
  return (
    <div className="recent-searches">
      <h3>🔍 Recent Searches</h3>
      {searches.length > 0 ? (
        <ul>
          {searches.map((search, index) => (
            <li key={index}>
              <Link to={`/search/${search.query}`}>{search.query}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent searches.</p>
      )}
    </div>
  );
};

export default RecentSearches;
