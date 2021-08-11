import React, { Component } from 'react'
import MyButton from '../../util/MyButton';
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
//Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
//Redux
import { connect } from "react-redux";
import { likeScream, unlikeScream } from "../../redux/actions/dataActions";

export class LikeButton extends Component {

    likedScream = () => {
        if (
          this.props.user.likes &&
          this.props.user.likes.find(
            like => like.screamId === this.props.screamId
          )
        )
          return true;
        else return false;
      };
      likeScream = () => {
       // console.log("likeScream function runs on button clike")
        this.props.likeScream(this.props.screamId);
        
        //console.log("props.likescream",this.props.likeScream)
      };
      unlikeScream = () => {
        this.props.unlikeScream(this.props.screamId);
      };

      

    render() {
      //console.log("like scream checking props.user recived",this.props.user)

        const {authenticated} = this.props.user
        const likeButton = !authenticated ? (
            <Link to="/login">
            <MyButton tip="like">
                <FavoriteBorder color="primary" />
            </MyButton>
            </Link>
          ) : this.likedScream() ? (
            <MyButton tip="Undo Like" onClick={this.unlikeScream}>
              <FavoriteIcon color="primary" />
            </MyButton>
          ) : (
            <MyButton tip="Like" onClick={this.likeScream}>
              <FavoriteBorder color="primary" />
            </MyButton>
          );
        return  likeButton
    }
}

LikeButton.propTypes ={
likeScream: PropTypes.func.isRequired,
unlikeScream: PropTypes.func.isRequired,

user:PropTypes.object.isRequired,
screamId :PropTypes.string.isRequired
}

const mapStateToProps = state =>({
     user: state.user,

})

const mapActionsToProps = {
    likeScream,
    unlikeScream
  };

export default connect(mapStateToProps,mapActionsToProps)(LikeButton)
