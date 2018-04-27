import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, lifecycle } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from 'react-google-maps';
import { googleMapUrl } from '../utils';

class BaseMap extends Component {
  static propTypes = {
    places: PropTypes.array.isRequired,
    directions: PropTypes.object,
    onDirectionsRendererMounted: PropTypes.func.isRequired,
    onMapMounted: PropTypes.func.isRequired,
    renderDirections: PropTypes.func.isRequired,
    fitBounds: PropTypes.func.isRequired,
    onDirectionsChanged: PropTypes.func.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    const nextPlaces = nextProps.places;
    const prevPlaces = this.props.places;
    const nextPlacesCount = nextPlaces.length;
    const prevPlacesCount = prevPlaces.length;

    if (nextPlaces !== prevPlaces && nextPlacesCount !== 0) {
      this.props.renderDirections(nextPlaces);

      if (nextPlacesCount !== prevPlacesCount) {
        this.props.fitBounds(nextPlaces);
      }
    }
  }

  renderRoute = () => {
    const { directions } = this.props;
    return <DirectionsRenderer
      ref={this.props.onDirectionsRendererMounted}
      options={{ draggable: true }}
      directions={directions}
      onDirectionsChanged={() => {
        this.props.onDirectionsChanged()
          .then(([geocodedData, index, nextDirections]) => {
            const currentDirectionsCount = directions.geocoded_waypoints.length;
            const nextDirectionsCount = nextDirections.geocoded_waypoints.length;

            if (nextDirectionsCount > currentDirectionsCount) {
              return;
            }

            this.props.updatePlacesAfterMarkerDragged(geocodedData, index);
          });
      }}
    />
  };

  renderMarker = () => {
    const [place] = this.props.places;
    const { location } = place.geometry;
    return <Marker
      key={place.place_id}
      position={{
        lat: location.lat(),
        lng: location.lng(),
      }}
    />
  };

  renderContent = () => {
    const shouldRenderMarker = this.props.places.length === 1;

    if (shouldRenderMarker) {
      return this.renderMarker();
    }

    if (this.props.directions) {
      return this.renderRoute();
    }
  };

  render() {
    return (
      <GoogleMap
        ref={this.props.onMapMounted}
        defaultZoom={10}
        defaultCenter={{ lat: 41.8507300, lng: -87.6512600 }}
      >
        {this.renderContent()}
      </GoogleMap>
    );
  }
}

const Map = compose(
  withProps({
    googleMapURL: googleMapUrl,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100%', width: '100%' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};

      this.setState({
        onMapMounted: (ref) => {
          refs.map = ref;
        },
        onDirectionsRendererMounted: (ref) => {
          refs.directionsRenderer = ref;
        },
        onDirectionsChanged: () => {
          if (!refs.directionsRenderer) {
            return undefined;
          }

          const geocoder = new google.maps.Geocoder(); // eslint-disable-line

          const directionsResult = refs.directionsRenderer.getDirections();

          // TODO fix getting marker index
          const draggedMarkerIndex = directionsResult.request.ac;
          const newPlaceId = directionsResult.geocoded_waypoints[draggedMarkerIndex].place_id;

          return new Promise((resolve) => {
            geocoder.geocode({
              placeId: newPlaceId,
            }, (result) => {
              resolve([result[0], draggedMarkerIndex, directionsResult]);
            });
          });
        },
        fitBounds: (places) => {
          if (!refs.map) {
            return;
          }

          const bounds = new google.maps.LatLngBounds(); // eslint-disable-line

          places.forEach((place) => {
            bounds.extend(place.geometry.location);
          });

          refs.map.fitBounds(bounds);
        },
      });
    },
    componentDidMount() {
      this.setState({
        renderDirections: (places) => {
          const googleMaps = google.maps; // eslint-disable-line
          const DirectionsService = new googleMaps.DirectionsService();

          // TODO refactor with reduce
          const origin = places[0].geometry.location;
          const destination = places[places.length - 1].geometry.location;
          const waypoints = places
            .slice(1, places.length - 1)
            .map(place => ({ location: place.geometry.location }));

          DirectionsService.route({
            origin,
            destination,
            waypoints,
            travelMode: googleMaps.TravelMode.WALKING,
          }, (result, status) => {
            const okStatus = googleMaps.DirectionsStatus.OK;

            if (status === okStatus) {
              this.setState({
                directions: result,
              });
            } else {
              console.error(`Error fetching directions ${result}. Status: ${status}`);
            }
          });
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap,
)(BaseMap);

export default Map;
