import React, { useState } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import axios from "axios";

function listing() {
  const fee_wallet = process.env.NEXT_PUBLIC_FEE_WALLET;
  const { isAuthenticated, Moralis, authenticate, web3, enableWeb3 } =
    useMoralis();
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState();
  const [projectLinks, setProjectLink] = useState([
    { type: "DISCORD", link: "" },
  ]);
  const [formFields, setFormFields] = useState({
    radixBased: "false",
    name: "",
    description: "",
    projectType: "NFTs",
    logoUrl: "",
    socialLinks: [{ type: "DISCORD", link: "" }],
  });
  const SOCIAL_LINKS = {
    DISCORD: "Discord",
    TWITTER: "Twitter",
    TELEGRAM: "Telegram",
    REDDIT: "Reddit",
    WEBSITE: "Website",
  };

  async function onChange(e) {
    if (!e.target.files) return;
    const data = e?.target?.files[0];
    if (!data) return;
    const fileURL = await saveFile(data);
    console.log(fileURL);
    setImgUrl(fileURL);
    setFormFields({ ...formFields, logoUrl: fileURL });
  }

  //function to save the file
  const saveFile = async (data) => {
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    return file._url;
  };

  const addLinks = (e) => {
    e.preventDefault();
    let newLink = { type: "DISCORD", link: "" };
    console.log(projectLinks);
    setProjectLink([...projectLinks, newLink]);
  };

  const handleFormChange = (index, event) => {
    let data = [...projectLinks];
    data[index][event.target.name] = event.target.value;
    setProjectLink(data);
    setFormFields({ ...formFields, socialLinks: data });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    chargeFee();
  };

  const chargeFee = async () => {
    if (!fee_wallet) return;
    if (!web3) await enableWeb3();
    console.log(web3);
    const bnbPrice = await getBNBPrice();
    let fee;
    if (formFields.radixBased === "true") {
      fee = 5;
    } else {
      fee = 10;
    }
    const transaction = await Moralis.transfer({
      type: "native",
      amount: Moralis.Units.ETH(fee / bnbPrice),
      receiver: fee_wallet,
    });
    setLoading(true);
    await transaction.wait();
    console.log("complete listing");
    completeListing();
  };

  const getBNBPrice = async () => {
    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );
    console.log(response.data.price / 100);
    return response.data.price / 100;
  };

  const completeListing = async () => {
    let previous_indexes = await getPreviousIndexes();

    if (previous_indexes?.length) {
      previous_indexes.push(formFields);
    } else {
      previous_indexes = [formFields];
    }

    console.log(previous_indexes);
    try {
      const file = new Moralis.File("formFields", {
        base64: Buffer.from(JSON.stringify(previous_indexes)).toString(
          "base64"
        ),
      });
      await file.saveIPFS();
      console.log(file._url);
      const List_indexes_uris = Moralis.Object.extend({
        className: "list_indexes_uris",
      });
      const list_indexes_uris = new List_indexes_uris();
      list_indexes_uris.save({
        date: new Date(),
        lists_index_uri: file._url,
      });
      setLoading(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getPreviousIndexes = async () => {
    const List_indexes_uris = Moralis.Object.extend("list_indexes_uris");
    const query = new Moralis.Query(List_indexes_uris);
    query.descending("date");
    query.limit(1);
    const results = await query.find();
    if (!results.length) return;

    const response = await axios.get(results[0].attributes.lists_index_uri);

    console.log(response.data);
    return response.data;
  };

  return (
    <div>
      {!isAuthenticated && web3 ? (
        <button onClick={() => authenticate()}>authenticate</button>
      ) : (
        <>
          <p>{isAuthenticated}</p>
          <form onSubmit={handleFormSubmit}>
            <label>Is your project Radix based? </label>
            <select
              onChange={(e) =>
                setFormFields({ ...formFields, radixBased: e.target.value })
              }
            >
              <option value={"false"}>No</option>
              <option value={"true"}>Yes</option>
            </select>
            <br />
            <label>Name of the project </label>
            <input
              type="text"
              onChange={(e) =>
                setFormFields({ ...formFields, name: e.target.value })
              }
            />
            <br />
            <label>Description </label>
            <textarea
              onChange={(e) =>
                setFormFields({ ...formFields, description: e.target.value })
              }
            />
            <br />
            <label>Is your project? </label>
            <select
              onChange={(e) =>
                setFormFields({ ...formFields, projectType: e.target.value })
              }
            >
              <option value="NFTs">NFTs</option>
              <option value="Token">Token</option>
              <option value="Validator Node">Validator Node</option>
            </select>
            <br />
            <label> Logo </label>
            <input type="file" onChange={onChange}></input>
            {imgUrl && <img src={imgUrl} height="150" width="150" />}
            <br />
            {projectLinks.map((link, index) => (
              <div key={index}>
                <select onChange={(e) => (link.type = e.target.value)}>
                  {Object.keys(SOCIAL_LINKS).map((link) => (
                    <option>{link}</option>
                  ))}
                </select>

                <input
                  name="link"
                  placeholder="https://your.site.io"
                  value={link.link}
                  onChange={(event) => handleFormChange(index, event)}
                />
              </div>
            ))}
            <button onClick={addLinks}>Add More Links..</button>
            <br />
            <button type="submit"> Submit </button>
          </form>
          {loading && <p>PROCESSING, PLEASE DO NOT REFRESH THE PAGE</p>}
        </>
      )}
    </div>
  );
}

export default listing;
