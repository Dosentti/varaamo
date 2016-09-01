import includes from 'lodash/includes';
import React, { Component, PropTypes } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Input from 'react-bootstrap/lib/Input';
import Well from 'react-bootstrap/lib/Well';
import { reduxForm } from 'redux-form';

import isEmail from 'validator/lib/isEmail';
import constants from 'constants/AppConstants';

const validators = {
  reserverEmailAddress: ({ reserverEmailAddress }) => {
    if (reserverEmailAddress && !isEmail(reserverEmailAddress)) {
      return 'Syötä kunnollinen sähköpostiosoite';
    }
    return null;
  },
};

const maxLengths = {
  billingAddressCity: 100,
  billingAddressStreet: 100,
  billingAddressZip: 30,
  company: 100,
  numberOfParticipants: 100,
  reserverAddressCity: 100,
  reserverAddressStreet: 100,
  reserverAddressZip: 30,
  reserverEmailAddress: 100,
  reserverId: 30,
  reserverName: 100,
  reserverPhoneNumber: 30,
};

export function validate(values, { fields, requiredFields }) {
  const errors = {};
  const currentRequiredFields = values.staffEvent ?
    constants.REQUIRED_STAFF_EVENT_FIELDS :
    requiredFields;
  fields.forEach((field) => {
    const validator = validators[field];
    if (validator) {
      const error = validator(values);
      if (error) {
        errors[field] = error;
      }
    }
    if (maxLengths[field]) {
      if (values[field] && values[field].length > maxLengths[field]) {
        errors[field] = `Kentän maksimipituus on ${maxLengths[field]} merkkiä`;
      }
    }
    if (includes(currentRequiredFields, field)) {
      if (!values[field]) {
        errors[field] = (
          field === 'termsAndConditions' ?
          'Sinun on hyväksyttävä tilan käyttösäännöt varataksesi tilan' :
          'Pakollinen tieto'
        );
      }
    }
  });
  return errors;
}

export class UnconnectedReservationForm extends Component {
  renderField(type, label, field, extraProps) {
    if (!field) {
      return null;
    }
    const hasError = field.error && field.touched;
    const isRequired = includes(this.requiredFields, field.name);

    return (
      <Input
        {...field}
        {...extraProps}
        bsStyle={hasError ? 'error' : null}
        help={hasError ? field.error : null}
        label={`${label}${isRequired ? '*' : ''}`}
        labelClassName="col-sm-3"
        type={type}
        wrapperClassName="col-sm-9"
      />
    );
  }

  renderStaffEventField(field) {
    if (!field) {
      return null;
    }
    return (
      <Well>
        <Input
          {...field}
          help={`
            Viraston oma tapahtuma hyväksytään automaattisesti ja ainoat pakolliset tiedot
            ovat varaajan nimi ja tilaisuuden kuvaus.
          `}
          label="Viraston oma tapahtuma"
          type="checkbox"
          wrapperClassName="col-md-12 checkbox-field"
        />
      </Well>
    );
  }

  renderTermsAndConditionsField(field) {
    if (!field) {
      return null;
    }
    const hasError = field.error && field.touched;
    return (
      <Input
        {...field}
        bsStyle={hasError ? 'error' : null}
        help={hasError ? field.error : null}
        label="Olen lukenut ja hyväksynyt tilan käyttösäännöt*"
        type="checkbox"
        wrapperClassName="col-md-12 checkbox-field"
      />
    );
  }

  render() {
    const {
      fields,
      isMakingReservations,
      handleSubmit,
      onClose,
      onConfirm,
      requiredFields,
    } = this.props;

    this.requiredFields = fields.staffEvent && fields.staffEvent.checked ?
      constants.REQUIRED_STAFF_EVENT_FIELDS :
      requiredFields;

    return (
      <div>
        <form className="reservation-form form-horizontal">
          {this.renderStaffEventField(fields.staffEvent)}
          {this.renderField('text', 'Varaaja / vuokraaja', fields.reserverName)}
          {this.renderField('text', 'Y-tunnus / henkilötunnus', fields.reserverId)}
          {this.renderField('text', 'Puhelin', fields.reserverPhoneNumber)}
          {this.renderField('email', 'Sähköposti', fields.reserverEmailAddress)}
          {this.renderField('textarea', 'Tilaisuuden kuvaus', fields.eventDescription, { rows: 5 })}
          {this.renderField(
            'number',
            'Osallistujamäärä',
            fields.numberOfParticipants,
            { min: '0' }
          )}
          { fields.reserverAddressStreet && (
            <Well>
              <p>Osoite</p>
              {this.renderField('text', 'Katuosoite', fields.reserverAddressStreet)}
              {this.renderField('text', 'Postinumero', fields.reserverAddressZip)}
              {this.renderField('text', 'Kaupunki', fields.reserverAddressCity)}
            </Well>
          )}
          { fields.billingAddressStreet && (
            <Well>
              <p>Laskutusosoite</p>
              {this.renderField('text', 'Katuosoite', fields.billingAddressStreet)}
              {this.renderField('text', 'Postinumero', fields.billingAddressZip)}
              {this.renderField('text', 'Kaupunki', fields.billingAddressCity)}
            </Well>
          )}
          {this.renderField(
            'textarea',
            'Kommentit',
            fields.comments,
            {
              placeholder: 'Varauksen mahdolliset lisätiedot',
              rows: 5,
            }
          )}
          {this.renderTermsAndConditionsField(fields.termsAndConditions)}
          <div className="form-controls">
            <Button
              bsStyle="default"
              onClick={onClose}
            >
              Takaisin
            </Button>
            <Button
              bsStyle="primary"
              disabled={isMakingReservations}
              onClick={handleSubmit(onConfirm)}
              type="submit"
            >
              {isMakingReservations ? 'Tallennetaan...' : 'Tallenna'}
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

UnconnectedReservationForm.propTypes = {
  fields: PropTypes.object.isRequired,
  isMakingReservations: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  requiredFields: PropTypes.array.isRequired,
};

export default reduxForm({
  form: 'preliminaryReservation',
  validate,
})(UnconnectedReservationForm);
