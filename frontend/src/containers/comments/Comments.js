import React, {Component} from 'react';
import { connect } from 'react-redux';

import * as actionCreators from '../../store/actions/index';
import Comment from './Comment';

import './Comments.css';

class Comments extends Component {

    state={
        content:''
    }

    componentDidMount() {
        this.props.getComments(this.props.recipeId)
            .then(res => {
                let list = res.comments.map(item => item.id)
                this.props.getReplySet(list)
            })
    }

    render() {
        
        const commentlist = this.props.comments.map( (item) => <Comment replies={this.props.replies.filter((reply) => reply.comment_id==item.id)} content={item.content} author={item.author_id} id={item.id}
            onEditComment={(content) => this.props.onEditComment({id: item.id, content, edited: true})} onDeleteComment={() => this.props.onDeleteComment(item.id)}/>)
        return (
            <div className='comments'>
                {commentlist}
                <input value={this.state.content} onChange={(e) => this.setState({content: e.target.value})}/>
                <button disabled={this.state.content==''} onClick={() => {this.setState({content: ''}); this.props.addComment({date:'2020-11-05', edited:false, content: this.state.content, recipeId: this.props.recipeId});}}>confirm</button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        comments: state.comment.comments,
        replies: state.reply.replies
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getComments: (recipeId) => dispatch(actionCreators.getComments(recipeId)),
        onEditComment: (comment) => dispatch(actionCreators.editComment(comment)),
        onDeleteComment: (commentId) => dispatch(actionCreators.deleteComment(commentId)),
        addComment: (comment) => dispatch(actionCreators.addComment(comment)),
        getReplySet: (comment_id_list) => dispatch(actionCreators.getReplySet(comment_id_list))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Comments);