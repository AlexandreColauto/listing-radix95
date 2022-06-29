import React, { useState, useEffect } from "react";
import axios from "axios";
import Details from "../components/details";
import styled from "styled-components";
import { Panel } from "react95";
import { Redis } from "@upstash/redis";

function Browser() {
  const [itemsMetadata, setItemsMetadata] = useState();
  const [details, setDetails] = useState();

  useEffect(() => {
    getListItems();
  }, []);

  const getListItems = async () => {
    const redis = new Redis({
      url: "https://eu1-dominant-jay-37402.upstash.io",
      token:
        "AZIaASQgMGYzMDQzNzYtMjk3My00NWRlLWFlZDEtOTNkODM4NTVkYjA3ZGNiNmY5ODhiMjg1NDFkOGE3YzAwZDRlZmY3N2NjZWM=",
    });

    const results = await redis.get("link");
    if (!results) return;

    const response = await axios.get(results);
    if (response.status === 200) {
      console.log(response.data);
      setItemsMetadata(response.data);
      return response.data;
    }
    //FRONTEND
    const Wrapper = styled.div`
      padding: 5rem;
      background: ___CSS_0___;
      #default-buttons button {
        margin-bottom: 1rem;
        margin-right: 1rem;
      }

      #cutout {
        background: ___CSS_1___;
        padding: 1rem;
        width: 300px;
      }
    `;
  };
  return (
    <div>
      {!details ? (
        <div>
          {itemsMetadata &&
            itemsMetadata.map((item, index) => (
              <Panel
                variant="outside"
                shadow
                key={index}
                style={{ padding: "0.5rem", lineHeight: "1.5", width: 755 }}
              >
                <div key={index} onClick={() => setDetails(item)}>
                  <img src={item.logoUrl} width="50" height="50" />
                  <span style={{ marginLeft: "10px" }}>{item.name}</span>
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
              </Panel>
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

export default Browser;
