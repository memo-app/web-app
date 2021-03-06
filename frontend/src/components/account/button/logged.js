// Imports
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// UI Imports
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SearchIcon from 'material-ui/svg-icons/action/search';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

// App Imports
import { userLogout } from '../../../actions/user';
import SearchBox from '../../search/SearchBox';

class UserButtonLogged extends Component {
    constructor() {
        super();

        this.state = {
            notification: false,
            loggedOut: false
        };
    }

    logout(event) {
        event.preventDefault();

        this.props.userLogout();
    }

    render() {
        return (
            <span>
                <Link to="/search">
                    <IconButton><SearchIcon color="#ffffff" /></IconButton>
                </Link>
                <IconMenu
                    iconButtonElement={
                        <IconButton><MoreVertIcon color="#ffffff" /></IconButton>
                    }
                    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                >
                    <Link to="/memo/add"><MenuItem primaryText="Add memo" /></Link>
                    <MenuItem primaryText="Sign out" onClick={this.logout.bind(this)} />
                </IconMenu>
            </span>
        );
    }
}

UserButtonLogged.propTypes = {
    userLogout: PropTypes.func.isRequired,
};

export default connect(null, { userLogout })(UserButtonLogged);