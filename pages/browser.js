import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import axios from "axios";
import Details from "./details";

function browser() {
  const [itemsMetadata, setItemsMetadata] = useState();
  const [details, setDetails] = useState();
  const { Moralis, web3, enableWeb3 } = useMoralis();

  useEffect(() => {
    getListItems();
  }, [Moralis]);

  const getListItems = async () => {
    if (!web3) await enableWeb3();
    const List_indexes_uris = Moralis.Object.extend("list_indexes_uris");
    const query = new Moralis.Query(List_indexes_uris);
    query.descending("date");
    query.limit(1);
    const results = await query.find();
    if (!results.length) return;

    const response = await axios.get(results[0].attributes.lists_index_uri);
    if (response.status === 200) {
      console.log(response.data);
      setItemsMetadata(response.data);
      return response.data;
    }
  };
  return (
    <div>
      {!details ? (
        <div>
          {itemsMetadata &&
            itemsMetadata.map((item, index) => (
              <div key={index} onClick={() => setDetails(item)}>
                <img src={item.logoUrl} width="50" height="50" />
                <span>{item.name}</span>
                <br />
                <span>#{item.projectType}</span>
                <span style={{ float: "right" }}>
                  {item.radixBased === "true" ? "Radix" : "BSC"}
                </span>
                <p>
                  {item.description.length > 240
                    ? item.description.slice(0, 240) + "..."
                    : item.description}
                </p>
                <hr />
              </div>
            ))}
        </div>
      ) : (
        <div>
          <Details listing={details} setListing={setDetails} />
        </div>
      )}
    </div>
  );
}

export default browser;
