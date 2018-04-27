import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import SearchBox from './components/SearchBox';
import Places from './components/Places';
import Map from './components/Map';

class App extends Component {
  state = {
    places: [],
  };

  isPlaceInState = newPlace =>
    this.state.places
      .some(place => place.place_id === newPlace.place_id);

  onPlacesChanged = (search) => {
    const [place] = search.getPlaces();

    if (place && !this.isPlaceInState(place)) {
      this.setState({
        places: [...this.state.places, place],
      });
    }
  };

  onPlaceDelete = (placeId) => {
    const nextPlaces = this.state.places.filter(place => place.place_id !== placeId);
    this.setState({
      places: nextPlaces,
    });
  };

  updatePlacesAfterMarkerDragged = (newPlace, index) => {
    const { places } = this.state;

    const nextPlaces = [
      ...places.slice(0, index),
      newPlace,
      ...places.slice(index + 1),
    ];

    this.setState({
      places: nextPlaces,
    });
  };

  render() {
    const { places } = this.state;
    return (
      <div className="App" style={{ textAlign: 'center' }}>
        <Grid container spacing={16} style={{ height: '100vh' }}>
          <Grid item xs={4}>
            <SearchBox onPlacesChanged={this.onPlacesChanged}/>
            <Places
              places={places}
              onPlaceDelete={this.onPlaceDelete}
            />
          </Grid>
          <Grid item xs={8}>
            <Map
              places={places}
              updatePlacesAfterMarkerDragged={this.updatePlacesAfterMarkerDragged}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
