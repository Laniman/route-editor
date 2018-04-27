import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps } from 'recompose';
import { withScriptjs } from 'react-google-maps';
import { StandaloneSearchBox } from 'react-google-maps/lib/components/places/StandaloneSearchBox';
import TextField from 'material-ui/TextField';
import { googleMapUrl } from '../utils';


class SearchBox extends Component {
  static propTypes = {
    onPlacesChanged: PropTypes.func.isRequired,
  };

  state = {
    searchTerm: '',
  };

  onSearchTermChange = (event) => {
    const newTerm = event.target.value;
    this.setState({
      searchTerm: newTerm,
    });
  };

  render() {
    return (
      <div data-standalone-searchbox="">
        <StandaloneSearchBox
          ref={(input) => {
            this.searchInput = input;
          }}
          onPlacesChanged={() => {
            this.props.onPlacesChanged(this.searchInput);
            this.setState({
              searchTerm: '',
            });
          }}
        >
          <TextField
            id="place"
            placeholder={'Enter route point'}
            value={this.state.searchTerm}
            onChange={this.onSearchTermChange}
            margin="normal"
          />
        </StandaloneSearchBox>
      </div>
    );
  }
}

const EnhancedSearchBox = compose(
  withProps({
    googleMapURL: googleMapUrl,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '400px' }} />,
  }),
  withScriptjs,
)(SearchBox);

export default EnhancedSearchBox;
