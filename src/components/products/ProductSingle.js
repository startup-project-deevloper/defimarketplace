import React, {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import "./ProductSingle.css";
import TextTruncate from "react-text-truncate";
import Product from "./Product";
import AddShoppingCartRoundedIcon from "@material-ui/icons/AddShoppingCartRounded";
import ShoppingCartRoundedIcon from "@material-ui/icons/ShoppingCartRounded";
import BookmarkRoundedIcon from "@material-ui/icons/BookmarkRounded";
import ReactTooltip from "react-tooltip";
import {useStateValue} from "../../StateProvider";
import db from "../../firebase";
import {motion} from "framer-motion";
import {shuffleArray} from "../../util";
import axios from "axios";

function ProductSingle() {
  const { id } = useParams();
  const location = useLocation();

  const [productDetails, setProductDetails] = useState(null);
  const [features, setFeatures] = useState([]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [{ cart, bookmarks, products, loadingBar, user }, dispatch] = useStateValue();

  useEffect(() => {
  	if(location.state && location.state.product) {
    	setProductDetails(location.state.product)
    	return;
    }
    if (loadingBar) {
      loadingBar.current.continuousStart();
    }

    axios.get(`/api/products?id=${id}`)
      .then((snapshot) => {
        setProductDetails(snapshot.data);
      })
      .then(() => {
        if (loadingBar) {
          loadingBar.current.complete();
        }
      });

      const user = db.collection("users").doc(productDetails.ownerId).get();
  }, [id]);

  console.log(user)
  const addToCart = (item) => {
    dispatch({
      type: "ADD_TO_CART",
      item: {
        ...productDetails,
        id: id,
        quantity: 1,
      },
    });
  };

  const addToBookmarks = (item) => {
    dispatch({
      type: "ADD_TO_BOOKMARKS",
      item: {
        ...productDetails,
        id: id,
      },
    });
  };

  const sendMessage = "";

  useEffect(() => {
  	if (products) {
        setSuggestions(shuffleArray(products));
    }
  }, [products]);

  useEffect(() => {
    const bIndex = bookmarks.findIndex((item) => item.id === id);
    if (bIndex >= 0) {
      setIsBookmarked(true);
    } else {
      setIsBookmarked(false);
    }

    const cIndex = cart.findIndex((item) => item.id === id);
    if (cIndex >= 0) {
      setIsAdded(true);
    } else {
      setIsAdded(false);
    }
  }, [bookmarks, cart, products, id]);

  return (
    <div className="productSingle">
      <div className="productSingle__inner">
        <motion.div layoutId={id} className="productSingle__image">
          <img src={productDetails?.imgUrl} />
        </motion.div>
        <div className="productSingle__details">
          <TextTruncate
            line={3}
            element="h1"
            containerClassName="productSingle__name"
            truncateText="…"
            text={productDetails?.name}
          />
          <ul className="productSingle__features">
            {productDetails?.feature?.map((features) => (
              <li>{features}</li>
            ))}
          </ul>
          <span className="productSingle__footer">
            <p className="productSingle__price">
              <h2>${productDetails?.price}</h2>{" "}
              {(productDetails?.discount) && (
                <small>
                  <del>
                    $
                    {productDetails?.originalPrice}
                  </del>
                </small>
              )}
            </p>
            {(productDetails?.price > 25)}
            <div className="buttons">
              {isAdded ? (
                <button className="buttonPrimary">
                  <ShoppingCartRoundedIcon /> Added
                </button>
              ) : (
                <button className="buttonPrimary" onClick={addToCart}>
                  <AddShoppingCartRoundedIcon /> Add To Cart
                </button>
              )}
              <button
                data-tip={isBookmarked ? "Remove" : "Bookmark"}
                data-for="bookmarkTooltip"
                className="buttonSecondary"
                onClick={addToBookmarks}
              >
                <BookmarkRoundedIcon
                  style={{
                    fill: isBookmarked ? "#fff" : "transparent",
                    stroke: "#fff",
                    strokeWidth: 2,
                    fontSize: 20,
                  }}
                />
              </button>
              <ReactTooltip
                place="right"
                className="app__toolTip"
                id="bookmarkTooltip"
                backgroundColor="#1a1a2cee"
                effect="solid"
              />
            </div>
            <div>
              From: <strong style={{
                    stroke: "#fff",
                    strokeWidth: 2,
                    fontSize: 20,
                    color: "green",
                  }}> {productDetails?.owner} </strong>
              <div className="buttons" style={{ marginLeft: "auto" }}>
                <button className="buttonSecondary" onClick={sendMessage}>
                  Send a message
                </button>
              </div>
            </div>
          </span>
        </div>
      </div>
      <div className="productSingle__suggested">
        <h5 style={{ marginTop: "3rem", marginBottom: "1rem" }}>
          You might also like
        </h5>
        <div className="products">
          {suggestions
            ?.slice(0, 3)
            .map((product) =>
              product.id != id ? (
                <Product id={product.id} item={product} />
              ) : null
            )}
        </div>
      </div>
    </div>
  );
}
export default ProductSingle;
