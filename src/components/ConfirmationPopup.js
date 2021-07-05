import React from "react";

const ConfirmationPopup = (props) => {
  <div class="overlay">
    <div class="popup">
      <p>Are you sure</p>
      <div class="text-right">
        <button onClick={props.onClose} class="btn btn-cancel">
          Cancel
        </button>
        <button onClick={props.onSubmit} class="btn btn-primary">
          Yes
        </button>
      </div>
    </div>
  </div>;
};

export default ConfirmationPopup;
