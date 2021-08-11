import React, { Component } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios'
import Scream from '../components/scream/Scream'
import StaticProfile from '../components/profile/StaticProfile'
import ScreamSkeleton from '../util/ScreamSkeleton';
import ProfileSkeleton from '../util/ProfileSkeleton';

import Grid from "@material-ui/core/Grid"

import {connect } from 'react-redux'
import {getUserData} from '../redux/actions/dataActions'

 class user extends Component {
    state ={
        profile:null,
        screamIdParams: null
    }

    componentDidMount(){
        //console.log("%c from user componentdidmount runs","font-size:200px;color:green;")
        const handle=this.props.match.params.handle;
        const screamId = this.props.match.params.screamId

        if(screamId)this.setState({screamIdParams: screamId})
        this.props.getUserData(handle)
        axios.get(`/user/${handle}`)
        .then(res =>{
            this.setState({profile:res.data.user})
        })
        .catch(err=>console.log(err))
    }

    render() {
        const {screams,loading} = this.props.data;
        const {screamIdParams} = this.state
        const screamsMarkup = loading ? (
            <ScreamSkeleton/>
        ):screams ===null ?(
            <p>No screams from this user</p>
        ): !screamIdParams ?(
            screams.map(scream=><Scream key={scream.Id} scream={scream} openDialog={false}/>)
            ):(
                screams.map(scream=>{
                    if(scream.screamId !==screamIdParams)
                    return <Scream key={scream.Id} scream={scream} openDialog={false}/>
                    else return <Scream key={scream.Id} scream={scream} openDialog={true}/>
                })
            )
        return (
            <Grid container spacing={10}>
                <Grid item sm ={8} XS={12}>
                    {screamsMarkup}
                </Grid>
                <Grid item sm ={4} XS={12}>
                    {this.state.profile === null ?(
                        <ProfileSkeleton/>
                    ):(
                        <StaticProfile profile={this.state.profile}/>
                    )}
                </Grid>
            </Grid>
        )
    }
}

user.propTypes ={
    getUserData : PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps =state => ({
    data: state.data
}) 

export default connect(mapStateToProps,{getUserData})(user)
