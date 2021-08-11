import React, { Fragment, useState , useEffect} from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import MyButton from "../../util/MyButton";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import CommentForm from "./CommentForm";
//MUI stuff
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
//ICON
import CloseIcon from "@material-ui/icons/Close";
import UnFoldMore from "@material-ui/icons/UnfoldMore";
import ChatIcon from "@material-ui/icons/Chat";

//Redux stuff
import { connect } from "react-redux";
import { getScream, clearErrors } from "../../redux/actions/dataActions";

import { useSelector/* , useDispatch */ } from 'react-redux';

const styles = (theme) => ({
  ...theme.spreadThis,
  profileImage: {
    maxWidth: 200,
    height: 200,
    borderRadius: "50%",
    objectFit: "cover",
  },
  dialogContent: {
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    left: "90%",
  },
  expandButton: {
    position: "absolute",
    left: "90%",
  },
  spinnerDiv: {
    textAlign: "center",
    marginTop: 50,
    marginBottom: 50,
  },
});


const ScreamDialog = props => {
  /* state = {
    open: false,
    oldPath: "",
    newPath: "",
    loading: false,
    comments:[]
  }; */

  //console.log("this is props ", props)

  const [open,setOpen] = useState(false);
  const [oldPath,setOldPath ] = useState('');
  const [newPath,setNewPath] = useState('');
  const [loading,setLoading] = useState(true);
  const [comments,setComments] = useState([]);
  

  /* componentDidMount() {
    if (this.props.openDialog === undefined) {
      console.log("handleOpen() runs")
      this.handleOpen();
    }
  } */
  useEffect(()=>{
   // console.log("useeffect runs")
    if(props.openDialog === true){
      console.log("handleOpen() runs")
      handleOpen();
    }
  },[])

  const handleOpen = () => {
    let oldPath = window.location.pathname;

    const { userHandle, screamId } = props;
    const newPath = `/users/${userHandle}/scream/${screamId}`;

    if (oldPath === newPath) oldPath = `/users/${userHandle}`;

    window.history.pushState(null, null, newPath);

    /* this.setState({ open: true, oldPath, newPath, loading:true });
    this.props.getScream(this.props.screamId, this); */
    setOpen(true);setOldPath(oldPath);setNewPath(newPath);setLoading(true);
    //console.log("GetScream runs")
    props.getScream(props.screamId);
  };
  const handleClose = () => {
    window.history.pushState(null, null, oldPath);

    /* this.setState({ open: false });
    this.props.clearErrors(); */
    setOpen(false);
    props.clearErrors();
  };

  
    var {
      classes,
      /* scream: {
        screamId,
        body,
        createdAt,
        likeCount,
        commentCount,
        userImage,
        userHandle,
        //comments,
      }, */
      //UI: { loading },
    } = props;


    const {
      scream: {
        screamId,
        body,
        createdAt,
        likeCount,
        commentCount,
        userImage,
        userHandle,
        //comments,
      },
      //UI: { loading },
    } = useSelector(state =>{return state.data});

    //const {loading,comments} = this.state
    //console.log("[this is comments]",comments)
    const commentsSelector = useSelector(state=>{/* console.log("this is state gotten from trying to use useSelector ",state); */ return state.data.scream.comments});
    const loadingSelector = useSelector(state => state.UI.loading );
    /* if( commentsSelector ){
      console.log("[this is comment gotten from using useSelector]", commentsSelector)
    console.log("[this is loading gotten from using useSelector]", loadingSelector)
    setLoading(loadingSelector);
    setComments(commentsSelector);
    }
     */

    //console.log("[this is comment gotten from using useSelector]", commentsSelector)
    //console.log("[this is loading gotten from using useSelector]", loadingSelector)
    
    var dialogMarkup = loadingSelector ? (
      
      <div className={classes.spinnerDiv}>
        {/* console.log("dialogMarkup renders loading= true") */}
        <CircularProgress size={200} thickness={2} />
      </div>
    ) : (
      <Grid container spacing={10}>
        {/* console.log("dialogMarkup renders loading= false") */}
        {/* console.log("[this is commentSelector]",loading, commentsSelector) */}

        <Grid item sm={5}>
          <img src={userImage} alt="Profile" className={classes.profileImage} />
        </Grid>
        <Grid item sm={7}>
          <Typography
            component={Link}
            color="primary"
            variant="h5"
            to={`/user/${userHandle}`}
          >
            @{userHandle}
          </Typography>
          <hr className={classes.invisibleSeparator} />
          <Typography variant="body2" color="textSecondary">
            {dayjs(createdAt).format("h:mm a, MMMM DD YYYY")}
          </Typography>
          <hr className={classes.invisibleSeparator} />
          <Typography variant="body1">{body}</Typography>
          <LikeButton screamId={screamId} />
          <span>{likeCount} likes</span>
          <MyButton tip="comments">
            <ChatIcon color="primary" />
          </MyButton>
          <span>{commentCount} comments</span>
        </Grid>
        <hr className={classes.visibleSeparator} />
        <CommentForm screamId={screamId} history={props.history}/>
        <Comments comments={commentsSelector} />
      </Grid>
    );

    
    return (
      <Fragment>
        {/* console.log("The return statement of screamDialog renders") */}
        <MyButton
          onClick={()=>{handleOpen()}}
          tip="Expand Scream"
          tipClassName={classes.expandButton}
        >
          <UnFoldMore color="primary" />
        </MyButton>
        <Dialog
          open={open}
          onClose={()=>{handleClose()}}
          fullWidth
          maxWidth="sm"
        >
          <MyButton
            tip="Close"
            onClick={()=>{handleClose()}}
            tipClassName={classes.closeButton}
          >
            <CloseIcon />
          </MyButton>
          <DialogContent className={classes.dialogContent}>
            {dialogMarkup}
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
  

ScreamDialog.propTypes = {
  clearErrors: PropTypes.func.isRequired,
  getScream: PropTypes.func.isRequired,
  screamId: PropTypes.string.isRequired,
  userHandle: PropTypes.string.isRequired,
  scream: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  scream: state.data.scream,
  UI: state.UI,
});

const mapActionsToProps = {
  getScream,
  clearErrors,
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(withStyles(styles)(ScreamDialog));
