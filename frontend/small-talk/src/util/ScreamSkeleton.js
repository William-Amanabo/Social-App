import React, {Fragment} from 'react'
import NoImg from '../images/no-img.png';
import PropTypes from 'prop-types'
//MUI
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import withStyles from '@material-ui/core/styles/withStyles'

const styles = theme => ({
    ...theme.spreadThis,
    images:{
        "max-width":"200px"
    }
  });

const  ScreamSkeleton = (props) =>{

    const {classes} = props
    
    const content = Array.from({length:5}).map((item,index)=>(
        <Card className={classes.card} key={index}>
            <CardMedia className={classes.cover} image={NoImg}>
                <img src={NoImg} alt="no-img" className={`${classes.images} ${classes.cover}`}/>
            </CardMedia>
            <CardContent className = {classes.cardContent}>
            <div className={classes.handle}/>
            <div className={classes.date}/>
            <div className={classes.fullLine}/>
            <div className={classes.fullLine}/>
            <div className={classes.halfLine}/>
            </CardContent>
        </Card>
    ))
    return (
        <Fragment>
            {content}
        </Fragment>
    )
}

ScreamSkeleton.propTypes ={
    classes: PropTypes.object.isRequired,

}

export default withStyles(styles)(ScreamSkeleton)
