/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

export const SelectUsers = (props) => {
  const useStyles = makeStyles((theme) => ({
    root: {
      "& > * + *": {
        marginTop: theme.spacing(3),
      },
    },
  }));
  const classes = useStyles();
  const [guests, setGuests] = useState([]);

  const onSelectItem = (event, guests) => {
    setGuests(guests);
    props.setSelectedGuests(guests);
  };

  useEffect(() => {
    if (props.defaultValue) {
      setGuests(props.defaultValue);
    }
  }, []);

  return (
    <div className={classes.root}>
      <Autocomplete
        multiple
        getOptionSelected={(option) =>
          guests.map((guest) => guest.id).includes(option.id)
        }
        onChange={onSelectItem}
        value={guests}
        id="multiple-limit-tags"
        options={props.users}
        getOptionLabel={(option) => `${option.name} ${option.lastName}`}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" placeholder="Search User" />
        )}
      />
    </div>
  );
};
