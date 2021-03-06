import React, {Component} from 'react';
import { connect } from 'react-redux';

import Replies from '../reply/Replies';

import './Comment.css'

class Comment extends Component {
    state={
        toggleReply: false,
    }
    onEdit = () => {
        let newContent = prompt("new comment", this.props.content); // edit comment prompt
        // if valid editing, change comment
        if(newContent){
            console.log(newContent)
            this.props.onEditComment(newContent)
        }
    }
    
    render() {
        console.log(this.state.toggleReply)
        const replies = <Replies replies={this.props.replies} commentId={this.props.id}/>
        return(
            <div>
                <p>{this.props.content} - {this.props.author}</p>
                {<button id='edit-comment-button' onClick={this.onEdit}>edit</button>}
                {<button id='delete-comment-button' onClick={() => this.props.onDeleteComment()}>delete</button>}
                <button onClick={()  => this.setState({toggleReply: !this.state.toggleReply})}>replies</button>
                {this.state.toggleReply?replies:null}
            </div>
        ) 
    }
}

export default Comment;
