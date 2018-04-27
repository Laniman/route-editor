import React, { Component } from 'react';
import PropTypes from 'prop-types';
import List, {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

class Places extends Component {
  static propTypes = {
    places: PropTypes.array.isRequired,
    onPlaceDelete: PropTypes.func.isRequired,
  };

  handleIconButtonClick = (placeId) => () => {
    this.props.onPlaceDelete(placeId);
  };

  render() {
    const places = this.props.places.map((place, i) => (
      <ListItem
        key={place.place_id}
      >
        <ListItemText
          primary={`#${i + 1}: ${place.formatted_address}`}
        >
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton aria-label="Delete" onClick={this.handleIconButtonClick(place.place_id)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));

    return (
      <List>
        {places}
      </List>
    );
  }
}

export default Places;
