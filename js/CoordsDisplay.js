import * as L from'leaflet';
import React, {Component} from 'react';
import * as Util from './Util';

export default class CoordsDisplay extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {cursor: L.latLng([0,0])};
  }

  setCursor(cursor) {
    this.setState({cursor: cursor});
  }

  render() {
    const [z, x] = Util.intCoords(this.state.cursor);
    return <div className='coords-display control-box leaflet-control leaflet-bar'>
      {'X ' + x + ' ' + z + ' Z'}</div>;
  }
}