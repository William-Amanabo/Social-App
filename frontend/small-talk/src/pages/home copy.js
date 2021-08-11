import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

import Scream from "../components/scream/Scream.js";
import Profile from "../components/profile/Profile.js";
import ScreamSkeleton from '../util/ScreamSkeleton';


import { connect } from "react-redux";
import { getScreams } from "../redux/actions/dataActions";

class home extends Component {
  componentDidMount() {
    this.props.getScreams();
  }
 state ={
  AllScreamsState:this.props.data.screams
 }
  render() {
    //const { screams, loading } = this.props.data;
    const {AllScreamsState} = this.state
    const {loading } = this.props.data;
    //this.setState({AllScreamsState: this.props.data.screams})
    console.log(AllScreamsState,loading)
    let recentScreamsMarkup = !loading ? (
      AllScreamsState.map(scream => <Scream key={scream.screamId} scream={scream} AllScreamsState={this}/>)
    ) : (
      <ScreamSkeleton/>
    );
    return (
      <Grid container spacing={10}>
        <Grid item sm={8} XS={12}>
          {recentScreamsMarkup}
        </Grid>
        <Grid item sm={4} XS={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  getScreams: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  data: state.data
});
export default connect(mapStateToProps, { getScreams })(home);
