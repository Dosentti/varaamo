import includes from 'lodash/collection/includes';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';

class ReservationControls extends Component {
  render() {
    const {
      onDeleteClick,
      onEditClick,
      reservation,
    } = this.props;

    if (!reservation || moment() > moment(reservation.end)) {
      return null;
    }

    return (
      <div className="buttons">
        {!includes(['accepted', 'canceled', 'declined'], reservation.status) && (
          <Button
            bsSize="xsmall"
            bsStyle="primary"
            onClick={onEditClick}
            >
            Muokkaa
          </Button>
        )}
        {!reservation.status && (
          <Button
            bsSize="xsmall"
            bsStyle="danger"
            onClick={onDeleteClick}
          >
            Poista
          </Button>
        )}
      </div>
    );
  }
}

ReservationControls.propTypes = {
  onDeleteClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  reservation: PropTypes.object,
};

export default ReservationControls ;
