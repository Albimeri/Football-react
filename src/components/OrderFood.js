import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import firebase from "firebase";
import { OrderStatus } from "../constants/enums";
import { handleOnKeyDownNumeric } from "./CommonHelpers";
const db = firebase.firestore();

export const OrderFood = (props) => {
  const [selectedFood, setSelectedFood] = useState(null);
  const [customFood, setCustomFood] = useState({ title: "", price: null });
  const [comment, setComment] = useState("");
  const [isAddCustom, setIsAddCustom] = useState(false);

  useEffect(() => {
    setSelectedFood(getMyFood());
    setComment(getMyFood()?.comment);
  }, []);

  useEffect(() => {
    if (props.order.status !== OrderStatus.ACTIVE) {
      props.setIsOrderFood(false);
    }
    if (props.order.restaurant.menu.length === 0) {
      setIsAddCustom(true);
    }
  }, [props.order]);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      padding: "50px",
      width: "500px",
      transform: "translate(-50%, -50%)",
    },
  };

  const me = props.order.guests.find(
    (guest) => guest.id === props.myUserInfo.id
  );

  const onSelectItem = (event, food) => {
    setSelectedFood(food);
  };

  const getMyFood = () => {
    const me = props.order.guests.find(
      (guest) => guest.id === props.myUserInfo.id
    );
    return me ? me.itemOrdered : null;
  };

  const saveOrder = () => {
    const order = { ...props.order };
    let selectedGuest = order.guests.find(
      (guest) => guest.id === props.myUserInfo.id
    );
    if (selectedGuest) {
      selectedGuest.itemOrdered = !isAddCustom
        ? { ...selectedFood, comment: comment || "", paid: 0 }
        : {
            ...customFood,
            price: parseFloat(customFood.price),
            comment: comment || "",
            paid: 0,
          };
      order.guests = [
        ...order.guests.filter((guest) => guest.id !== props.myUserInfo.id),
        selectedGuest,
      ];
    } else {
      selectedGuest = props.myUserInfo;
      selectedGuest.itemOrdered = !isAddCustom
        ? { ...selectedFood, comment, paid: 0 }
        : {
            ...customFood,
            price: parseFloat(customFood.price),
            comment: comment || "",
            paid: 0,
          };
      order.guests = [...order.guests, selectedGuest];
    }
    db.collection("orders").doc(order.id).update(order);
    props.setIsOrderFood(false);
  };

  const cancelOrder = () => {
    const order = { ...props.order };
    let selectedGuest = order.guests.find(
      (guest) => guest.id === props.myUserInfo.id
    );
    selectedGuest.itemOrdered = null;
    order.guests = [
      ...order.guests.filter((guest) => guest.id !== props.myUserInfo.id),
      selectedGuest,
    ];
    db.collection("orders").doc(order.id).update(order);
    props.setIsOrderFood(false);
  };

  const handleCustomFoodTitle = (event) => {
    setCustomFood((prevState) => ({ ...prevState, title: event.target.value }));
  };

  const handleCustomFoodPrice = (event) => {
    setCustomFood((prevState) => ({ ...prevState, price: event.target.value }));
  };

  const canSave = () => {
    let result = true;
    if (isAddCustom) {
      result = !(customFood.price && customFood.title);
    } else {
      result = !selectedFood;
    }
    return result;
  };

  return (
    <Modal
      isOpen={true}
      contentLabel="Order View"
      style={customStyles}
      ariaHideApp={false}
      onRequestClose={() => props.setIsOrderFood(false)}
    >
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h1>{props.order.restaurant.name}</h1>
          </div>
          <div
            className="col-1"
            onClick={() => {
              props.setIsOrderFood(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              className="bi bi-x"
              viewBox="0 0 16 16"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </div>
        </div>

        {!isAddCustom && (
          <div className="row">
            <div className="col-12">
              <Autocomplete
                clearOnEscape
                onChange={onSelectItem}
                value={selectedFood}
                clearOnBlur
                id="combo-box-demo"
                options={props.order.restaurant.menu}
                getOptionLabel={(option) =>
                  `${option.title}  ${option.price} €`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search Food"
                    variant="outlined"
                  />
                )}
              />
            </div>
          </div>
        )}
        {isAddCustom && (
          <div className="row">
            <div className="col-6">
              Food
              <input
                type="text"
                className="form-control"
                onChange={handleCustomFoodTitle}
                value={customFood.title}
              />
            </div>
            <div className="col-6">
              Price
              <input
                className="form-control"
                type="number"
                min="0"
                onKeyDown={handleOnKeyDownNumeric}
                onChange={handleCustomFoodPrice}
                value={customFood.price}
              />
            </div>
          </div>
        )}

        <br></br>

        {props.order.restaurant.menu.length > 0 && (
          <>
            <div className="row">
              <div className="col-6">
                <div
                  className="form-check cursor-pointer"
                  onClick={() => setIsAddCustom(false)}
                >
                  <input
                    className="form-check-input cursor-pointer"
                    type="radio"
                    checked={!isAddCustom}
                    onChange={() => {}}
                  />
                  <label className="form-check-label cursor-pointer">
                    Order from list
                  </label>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="form-check cursor-pointer"
                  onClick={() => setIsAddCustom(true)}
                >
                  <input
                    className="form-check-input cursor-pointer"
                    type="radio"
                    checked={isAddCustom}
                    onChange={() => {}}
                  />
                  <label className="form-check-label cursor-pointer">
                    Add custom item
                  </label>
                </div>
              </div>
            </div>
            <br></br>
          </>
        )}

        {
          <div className="row">
            <div className="col-12">
              Comment
              <input
                type="text"
                className="form-control"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </div>
          </div>
        }
        <br></br>
        <div>
          <button
            type="button"
            disabled={canSave()}
            className="btn btn-primary"
            onClick={saveOrder}
          >
            Save
          </button>
          {me && me.itemOrdered && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={cancelOrder}
            >
              Cancel Order
            </button>
          )}
          <button
            type="button"
            className="btn btn-light"
            onClick={() => props.setIsOrderFood(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
