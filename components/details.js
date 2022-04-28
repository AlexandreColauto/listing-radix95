import React from "react";

function Details({ listing, setListing }) {
  return (
    <div>
      <img src={listing.logoUrl} width="250" height="250" />
      <span>#{listing.projectType}</span>
      <br />
      <span>{listing.name}</span>
      <span style={{ float: "right" }}>
        {listing.radixBased === "true" ? "Radix" : "BSC"}
      </span>
      <p>{listing.description}</p>
      <div>
        {listing.socialLinks.map(
          (link, index) =>
            link.link && (
              <div key={index}>
                <p>{link.type}</p>
                <p>{link.link}</p>
              </div>
            )
        )}
      </div>
      <hr />
      <button onClick={() => setListing(null)}>Back</button>
    </div>
  );
}

export default Details;
