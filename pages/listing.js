import React, { useState } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import axios from "axios";
import styled from "styled-components";
import { Panel } from "react95";
import { Select, TextField,Fieldset,Button } from "react95";

function Listing() {
  const fee = process.env.NEXT_PUBLIC_FEE_AMOUNT;
  const radix95 = process.env.NEXT_PUBLIC_RADIX_ADDRESS;
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
  const optionsyesno = [
    { value: true, label: "YES" },
    { value: false, label: "NO" },
  ];
  const optionsproyect = [
    { value: "NFTs", label: "NFTs" },
    { value: "Token", label: "Token" },
    { value: "Validator Node", label: "Validator Node" },
  ];
  const optionssociallinks = [
    { value: "Discord", label: "DISCORD" },
    { value: "Twitter", label: "TWITTER" },
    { value: "Telegram", label: "TELEGRAM" },
    { value: "Reddit", label: "REDDIT" },
    { value: "Website", label: "WEBSITE" },


  ];

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
    if (formFields.radixBased === "true") {
      const transaction = await Moralis.transfer({
        amount: Moralis.Units.Token(fee, 9),
        receiver: "0x000000000000000000000000000000000000dEaD",
        type: "erc20",
        contractAddress: radix95,
      });
      setLoading(true);
      await transaction.wait();
    } else {
      const transaction = await Moralis.transfer({
        amount: Moralis.Units.Token(2 * fee, 9),
        receiver: "0x000000000000000000000000000000000000dEaD",
        type: "erc20",
        contractAddress: radix95,
      });
      setLoading(true);
      await transaction.wait();
    }
    console.log("complete listing");
    completeListing();
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
            <Select
              formatDisplay={(opt) => `${opt.label.toUpperCase()} `}
              onChange={(e) =>
                setFormFields({ ...formFields, radixBased: e.target.value })
              }
              options={optionsyesno}
              width={90}
            />
            <br />

            <br />
            <label>Name of the project </label>
            <TextField
              type="text"
              onChange={(e) =>
                setFormFields({ ...formFields, name: e.target.value })
              }
            />
            <br />
            <label>Description </label>
            <TextField
              multiline
              rows={2}
              fullWidth
              onChange={(e) =>
                setFormFields({
                  ...formFields,
                  description: e.target.value,
                })
              }
            />
            <br />
            <label>Is your project? </label>
            
            <Select
              onChange={(e) =>
                setFormFields({
                  ...formFields,
                  projectType: e.target.value,
                })
              }
  
              options={optionsproyect}
              width={190}
            />
            <br />
            <Fieldset label="Logo">
           
            <input type="file" onChange={onChange}></input>
            {imgUrl && <img src={imgUrl} height="150" width="150" />}
            </Fieldset>
            <br />
            <Fieldset label="Social Links">
            {projectLinks.map((link, index) => (
              <div key={index} display="flex" className="sociallinks">
                <Select fullWidth onChange={(e) => (link.type = e.target.value)}
                options={optionssociallinks}/>
                <TextField 
                fullWidth
                name="link"
                  placeholder="https://your.site.io"
                  value={link.link} 
                  onChange={(event) => handleFormChange(index, event)}/>
              </div>
            ))}
             <Button onClick={addLinks}>Add More Links..</Button>
            </Fieldset>
           
            <br />
            <Button fullWidth type="submit"> Submit </Button>
          </form>
          {loading && <p>PROCESSING, PLEASE DO NOT REFRESH THE PAGE</p>}
        </>
      )}
    </div>
  );
}

export default Listing;
