import React, {Component} from 'react';
import './App.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import TelegramLoginButton from 'react-telegram-login';
import DialogForm from './DialogForm';
import axios from 'axios'
import {
    Button,
    Modal,
    Grid,
    Row,
    Col,
    Media
} from 'react-bootstrap'
import config from './config';

const proxy = 'https://cors.io/?';

class App extends Component {

    constructor(props) {
        super(props);
        this.handleTelegramResponse = this.handleTelegramResponse.bind(this);
        this.getTaskList = this.getTaskList.bind(this);
        this.removeTask = this.removeTask.bind(this);
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.changeTask = this.changeTask.bind(this);

        axios.interceptors.response.use((response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    this.setState({auth: null})
                } else {
                    return Promise.reject(error);
                }
            });

        this.state = {};
        const auth = localStorage.getItem('auth');

        if (auth) {
            this.state.auth = JSON.parse(auth);
            this.state.loading = true;

            this.getTaskList().then(res => {

                if (res) this.setState({loading: false, tasks: res.data})
            })
        }

        const bittrex = new window.ccxt.bittrex({proxy});
        const binance = new window.ccxt.binance({proxy});
        const poloniex = new window.ccxt.poloniex({proxy});

        Promise.all([
            bittrex.loadMarkets(),
            binance.loadMarkets(),
            poloniex.loadMarkets()]).then(data => {
            const [bittrexMarkets,
                binanceMarkets,
                poloniexMarkets] = data;

            const markets = {
                bittrex: mapMarkets(bittrexMarkets),
                binance: mapMarkets(binanceMarkets),
                poloniex: mapMarkets(poloniexMarkets),
            };


            this.setState({markets});

            function mapMarkets(markets) {
                return Object.values(markets)
                    .filter(item => item.quote === 'BTC')
                    .map(item => ({label: item.base, value: item.base}))
            }
        })


    }

    handleTelegramResponse(auth) {
        localStorage.setItem('auth', JSON.stringify(auth));

        this.setState({auth});

        this.getTaskList().then(res => {
            this.setState({tasks: res.data, loading: false});
        });
    }

    removeTask(id) {
        this.setState({loading: true});
        return axios.delete(`${config.backend}/task?auth=${JSON.stringify(this.state.auth)}&id=${id}`)
            .then(() => {
                let tasks = this.state.tasks.filter(i => i._id !== id);
                this.setState({tasks, loading: false})
            })
    }

    handleOpenDialog() {

        this.setState({showDialog: true})
    }

    handleCloseDialog() {
        this.setState({showDialog: false, selectedTask: null})
    }


    getTaskList() {
        return axios.get(`${config.backend}/task?auth=${JSON.stringify(this.state.auth)}`)
    }

    handleSubmit(task, isUpdate) {
        let tasks;
        if (isUpdate) {
            const newState = Object.assign({}, this.state);
            const index = newState.tasks.findIndex(x => x._id === task._id);
            newState.tasks[index] = task;
            tasks = [...newState.tasks];
        } else {
            tasks = [...this.state.tasks, task];
        }

        this.setState({
            tasks,
            showDialog: false,
            selectedTask: null
        })
    }

    changeTask(id) {
        const task = this.state.tasks.find(i => i._id === id);
        this.setState({selectedTask: Object.assign({}, task), showDialog: true});
    }

    columns = [
        {
            Header: 'Exchange',
            accessor: 'exchange',
            Cell: ({value}) => (`${value.charAt(0).toUpperCase() + value.slice(1)}`)
        },
        {
            Header: 'Currency',
            accessor: 'currency',
            Cell: ({value}) => (`${value}/BTC`)
        },
        {
            Header: 'Interval',
            accessor: 'interval',
            Cell: ({value}) => `${value} min`
        },
        {
            Header: 'Type of book',
            accessor: 'bookType',
            Cell: ({value}) => (value === 0 ? 'Both' : value === 1 ? 'Buy' : 'Sell')
        },
        {
            Header: 'Price range',
            accessor: 'priceRange',
            Cell: ({value}) => `${value}%`
        },
        {
            Header: 'Filter type',
            accessor: 'filterType',
            Cell: ({value}) => (value === 0 ? '% of book' : 'BTC')
        },
        {
            Header: 'Filter value',
            accessor: 'filterValue'
        },
        {
            Header: 'Status',
            accessor: 'active',
            Cell: ({value}) => (value ? 'online' : 'stopped')

        },
        {
            accessor: '_id',
            Cell: ({value}) => (
                <div className="App-table-controls">
                    <Button disabled={!this.state.markets} bsSize="xsmall" bsStyle="warning" onClick={() => this.changeTask(value)}>Change</Button>
                    <Button bsSize="xsmall" bsStyle="danger" onClick={() => this.removeTask(value)}>Remove</Button>
                </div>
            ),
        }
    ];

    render() {
        const header = (
            <Row>
                <Col>
                    <h2><span role='img' aria-label="shield">🔰</span> Task list</h2>
                </Col>
            </Row>
        );

        const markup = (
            <Grid>
                {header}
                <Row>
                    <Media>
                        <Media.Body></Media.Body>
                        <Media.Right>
                            <Button disabled={!this.state.markets} bsStyle="primary" onClick={this.handleOpenDialog}>
                                Create task
                            </Button>
                        </Media.Right>
                    </Media>

                </Row>
                <Row>
                    <Col>
                        <ReactTable
                            defaultPageSize={10}
                            loading={this.state.loading}
                            data={this.state.tasks}
                            columns={this.columns}
                            filterable={false}/>
                    </Col>
                </Row>
                <Modal show={this.state.showDialog}
                       onHide={this.handleCloseDialog}>
                    <DialogForm onSubmit={this.handleSubmit}
                                markets={this.state.markets}
                                data={this.state.selectedTask}/>
                </Modal>
                <Row>
                    <Media>
                        <Media.Body></Media.Body>
                        <Media.Right>
                            <a href={`https://t.me/${config.bot_name}`} target="_blank">{config.bot_name}</a>
                        </Media.Right>
                    </Media>
                </Row>
            </Grid>
        );

        if (this.state.auth) {
            return markup
        }

        return (
            <Grid>
                {header}
                <Row>
                    <Col xsOffset={4}>
                        <TelegramLoginButton dataOnauth={this.handleTelegramResponse} botName={config.bot_name}/>
                    </Col>
                </Row>
            </Grid>
        )


    }
}

export default App;