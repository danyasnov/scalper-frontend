import React, {Component} from 'react';
import './App.css';
import 'react-table/react-table.css'
import axios from 'axios'
import Select from 'react-select';
import {
    Button,
    Modal,
    FormGroup,
    ControlLabel,
    FormControl,
    ButtonToolbar,
    ToggleButtonGroup,
    ToggleButton,
    InputGroup
} from 'react-bootstrap'
import 'react-select/dist/react-select.css';
import './DialogForm.css'
import config from './config'


class DialogForm extends Component {

    constructor(props) {
        super(props);

        // console.log(props.data)

        if (props.data) {
            this.state = props.data
        } else {
            this.state = {
                currency: 'ETH',
                interval: 5,
                bookType: 1,
                filterType: 0,
                filterValue: 30,
                priceRange: 100
            };
        }


        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFilterValue = this.validateFilterValue.bind(this);
        this.validatePriceRange = this.validatePriceRange.bind(this);
    }


    handleSubmit(e) {
        e.preventDefault();

        if (this.validateFilterValue() === 'success' && this.validatePriceRange() === 'success') {
            const auth = JSON.parse(JSON.stringify(localStorage.getItem('auth')));
            let {currency, interval, filterType, filterValue, bookType, _id, priceRange} = this.state;

            axios.post(`${config.backend}/task?auth=${auth}`, {
                _id,
                currency,
                interval,
                filterType,
                filterValue,
                bookType,
                priceRange,
                active: true
            }).then((res) => {
                this.props.onSubmit(res.data, !!_id);
            })
        }

    }


    handleInputChange(value, name) {
        if (name === 'filterValue' && value) value = parseInt(value, 10);

        this.setState({
            [name]: value
        });
    }

    validateFilterValue() {
        const value = this.state.filterValue;
        const type = this.state.filterType;
        if ((type === 1 && value > 0) || (type === 0 && value <= 100 && value > 0)) return 'success';
        else return 'error';
    }

    validatePriceRange() {
        const value = this.state.priceRange;
        if (value >= 0 && value <=100) return 'success';
        else return 'error';
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Create task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormGroup controlId="formControlsCurrency">
                        <ControlLabel>Currency</ControlLabel>
                        <Select
                            clearable={false}
                            backspaceRemoves={false}
                            name="form-field-name"
                            onChange={e => this.handleInputChange(e && e.value, 'currency')}
                            value={this.state.currency}
                            options={this.props.currencies}
                        />
                    </FormGroup>

                    <FormGroup controlId="formControlsInterval">
                        <ControlLabel>Update interval (min)</ControlLabel>
                        <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="interval"
                                               onChange={e => this.handleInputChange(e, 'interval')}
                                               value={this.state.interval}>
                                <ToggleButton value={1}>1</ToggleButton>
                                <ToggleButton value={5}>5</ToggleButton>
                                <ToggleButton value={15}>15</ToggleButton>
                                <ToggleButton value={30}>30</ToggleButton>
                                <ToggleButton value={60}>60</ToggleButton>
                            </ToggleButtonGroup>
                        </ButtonToolbar>
                    </FormGroup>

                    <FormGroup controlId="formControlsType">
                        <ControlLabel>Type of book</ControlLabel>
                        <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="bookType" value={this.state.bookType}
                                               onChange={e => this.handleInputChange(e, 'bookType')}>
                                <ToggleButton value={0} disabled>Both</ToggleButton>
                                <ToggleButton value={1}>Buy</ToggleButton>
                                <ToggleButton value={2}>Sell</ToggleButton>
                            </ToggleButtonGroup>
                        </ButtonToolbar>
                    </FormGroup>

                    <FormGroup validationState={this.validatePriceRange()}>
                        <ControlLabel>Price range</ControlLabel>
                        <InputGroup>
                            <FormControl
                                type="number"
                                onChange={e => this.handleInputChange(e.target.value, 'priceRange')}
                                value={this.state.priceRange}
                            />
                            <InputGroup.Addon>%</InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup>
                        <ControlLabel>Filter changes by</ControlLabel>
                        <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="filterType" value={this.state.filterType}
                                               onChange={e => this.handleInputChange(e, 'filterType')}>
                                <ToggleButton value={0}>% of book</ToggleButton>
                                <ToggleButton value={1}>BTC</ToggleButton>
                            </ToggleButtonGroup>
                        </ButtonToolbar>

                    </FormGroup>

                    <FormGroup validationState={this.validateFilterValue()}>
                        <ControlLabel>Filter value</ControlLabel>
                        <InputGroup>
                            <FormControl
                                type="number"
                                onChange={e => this.handleInputChange(e.target.value, 'filterValue')}
                                value={this.state.filterValue}
                            />
                            <InputGroup.Addon>{this.state.filterType === 0 ? '%' : 'BTC'}</InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>

                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" onClick={this.handleCloseDialog}>Submit</Button>
                </Modal.Footer>
            </form>

        );

    }
}

export default DialogForm;