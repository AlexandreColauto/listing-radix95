import React, { useState, useEffect } from "react";
import axios from "axios";
import Details from "../components/details";
import styled from "styled-components";
import { Panel } from "react95";
import { Redis } from "@upstash/redis";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";

function Browser() {
  const [itemsMetadata, setItemsMetadata] = useState();
  const [details, setDetails] = useState();
  const [pagesRange, setPages] = useState([]);
  const [currentPageItems, setPagesItems] = useState();
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getListItems();
    verifyAdmin();
  }, []);

  useEffect(() => {
    paginate(1);
  }, [itemsMetadata]);

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
      setPagesItems(response.data.slice(0, pageSize));
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
  const verifyAdmin = async () => {
    const admin_wallet = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    if (!admin_wallet) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log(await signer.getAddress());
    const address = await signer.getAddress();
    if (address.toLowerCase() === admin_wallet.toLowerCase()) {
      setIsAdmin(true);
    }
  };

  //create pagination functions fro the itemsMetadata
  const paginate = (pageNumber) => {
    if (!itemsMetadata) return;
    if (isNaN(pageNumber)) return;
    setCurrentPage(pageNumber);
    const startIndex = (pageNumber - 1) * pageSize;
    setPagesItems(itemsMetadata.slice(startIndex, startIndex + pageSize));
    getPagesArray(pageNumber);
  };

  function getPagesArray(pageNumber) {
    const numberOfPages = Math.ceil(itemsMetadata.length / pageSize);
    if (numberOfPages <= 6) {
      setPages(Array.from({ length: numberOfPages }, (_, i) => i + 1));
    } else if (numberOfPages > 6 && pageNumber < 4) {
      console.log(numberOfPages);
      setPages([1, 2, 3, 4, "...", numberOfPages]);
    } else if (
      pageNumber >= 4 &&
      pageNumber < numberOfPages - 3 &&
      numberOfPages > 6
    ) {
      setPages([
        1,
        "...",
        pageNumber - 1,
        pageNumber,
        pageNumber + 1,
        "...",
        numberOfPages,
      ]);
    } else if (pageNumber >= numberOfPages - 3 && numberOfPages > 6) {
      setPages([
        1,
        "...",
        numberOfPages - 4,
        numberOfPages - 3,
        numberOfPages - 2,
        numberOfPages - 1,
        numberOfPages,
      ]);
    }
  }

  //delete an item from itemsMetadata based on  index of the currentPageItems
  const deleteItems = async (index) => {
    const admin_wallet = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log(await signer.getAddress());
    const address = await signer.getAddress();
    if (address.toLowerCase() !== admin_wallet.toLowerCase()) return;
    const newItemsMetadata = [...itemsMetadata];
    const deleteIndex = index + pageSize * (currentPage - 1);
    console.log(deleteIndex);
    newItemsMetadata.splice(deleteIndex, 1);
    console.log(newItemsMetadata);
    console.log(itemsMetadata);
    let ipfs = create({
      url: "https://ipfs.infura.io:5001/api/v0",
    });
    const ipfsLink = await ipfs.add(JSON.stringify(newItemsMetadata));

    const redis = new Redis({
      url: "https://eu1-dominant-jay-37402.upstash.io",
      token:
        "AZIaASQgMGYzMDQzNzYtMjk3My00NWRlLWFlZDEtOTNkODM4NTVkYjA3ZGNiNmY5ODhiMjg1NDFkOGE3YzAwZDRlZmY3N2NjZWM=",
    });

    redis.set("link", "https://cf-ipfs.com/ipfs/" + ipfsLink.path);
    setItemsMetadata(newItemsMetadata);
  };
  return (
    <div>
      {!details ? (
        <div>
          {currentPageItems &&
            currentPageItems.map((item, index) => (
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
                {isAdmin && (
                  <button onClick={() => deleteItems(index)}>Delete</button>
                )}
              </Panel>
            ))}
          <div style={{ paddingTop: "10px" }}>
            {itemsMetadata &&
              pagesRange.length > 0 &&
              pagesRange.map((text, i) => (
                <a
                  href="#"
                  style={{ margin: "5px" }}
                  key={i}
                  onClick={() => paginate(parseInt(text))}
                >
                  {text}
                </a>
              ))}
          </div>
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
