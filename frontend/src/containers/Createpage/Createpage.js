import React, {Component} from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
// Local imports
import './Createpage.css'
import * as actionCreators from '../../store/actions/index'
import CreateStep from './CreateStep';

// TODO: must retreive ingredients
// TODO: must resize image before previewing
// TODO: Now it renders with descriptionList. Instead make a single array where each element contains imageList,
//       descriptionList and imagePreviewList
// (?)TODO(?): abstract the add image part, but the problem is later, I will have to add a delete part...
class Createpage extends Component{
   
   state = {
       name:'',
       ingredient: '',
       time: '',
       typeList: [],
       price: '',
       ////////
       descriptionList: [],
       imageList: [],
       imagePreviewList: [],
   }
   inputHandler = this.inputHandler.bind(this);
   imageHandler = this.imageHandler.bind(this);


    inputHandler(params){
        let description = params['description']
        let index = params['index']
        let newList = this.state.descriptionList;
        newList[index] = description
        this.setState({descriptionList: newList})
        console.log(this.state)
    }
    imageHandler(params){
        let index = params['index']
        let file = params['file']
        let reader = new FileReader();
    // console.log(reader.readyState) // 0 is for empty, 1 is for loading, and 2 is for completed
        reader.onloadend = () => {
            let newImgList = this.state.imageList;
            let newPreviewList = this.state.imagePreviewList;
            newImgList[index] = file;
            newPreviewList[index] = reader.result
            this.setState({
                imageList: newImgList,
                imagePreviewList: newPreviewList
            })
        }
        reader.readAsDataURL(file)
        console.log(this.state)
    }

    addStepHandler(){
        let newList = this.state.descriptionList
        console.log(newList)
        newList.push(null)
        console.log(newList)
        this.setState({descriptionList: newList})
    }

    submitHandler(){
        //this.props.history.push('/main-page');
        //this.props.onCreate()
        console.log(this.state)
    }
    
    onClickChangeColor(event, param){
        if (!this.state.typeList.includes(param)){
            event.target.style.backgroundColor = 'grey'
            this.setState({typeList: this.state.typeList.concat(param)})
        }
        else{
            event.target.style.backgroundColor = null
            this.setState({typeList: this.state.typeList.filter((type)=>{if(type!=param) return type})})
        }
    }

    render(){
        let displayStepList;
        displayStepList = this.state.descriptionList.map((item, index) => (
            <div>
                <CreateStep data={item} event_text={this.inputHandler} event_image={this.imageHandler} index={index}/>   
                <img src={this.state.imagePreviewList[index]}/>
            </div>
        ))

        return(
            <div className="CreateBackground">
                <div className="CreatepageBlock">
                    <div className="Createpage">
                        <label> 레시피 등록 </label>
                        <br/>
                        <div className = 'create_first'>
                            <p>레시피 제목</p>
                            <input id="recipe-title-input" type='text' placeholder='Title' name='title' 
                            onChange={(event) => this.setState({name: event.target.value})}/>
                            <br/>
                            <p>재료 추가</p>
                            <select name="Ingredients" id="ingredients" 
                                value={this.state.value} onChange={(event) => this.setState({ingredient: event.target.value})}>
                                <option id='ingredient' value="ramyun">라면</option>
                                <option id='ingredient' value="sausage">소시지</option>
                                <option id='ingredient' value="kimbap">삼각김밥</option>
                                <option id='ingredient' value="juice">쥬시클</option>
                            </select>
                            <br/>
                            <p>예상 조리 시간</p>
                            <input id="recipe-cooking-time-input" type='number' 
                                value={this.state.value} onChange={(event) => this.setState({time: event.target.value})} 
                                placeholder='minutes' name='cooking-time' />
                            {"  분"}
                        </div>
                        <br/>
                        <div className = 'create_second'>
                            <p>조리 방법</p>
                            {displayStepList}
                            <br/>
                            <button id='addStep' onClick={() => this.addStepHandler()}>Click to add a step</button>
                            <br/>
                        </div>
                        <br/>
                        <div className = 'create_third'>
                            <div className='buttons'>
                                <p>카테고리 선택</p>
                                <button id='type' className = "type_first" onClick={(event)=>this.onClickChangeColor(event, 'Italian')}>Italian</button>
                                <button id='type' onClick={(event)=>this.onClickChangeColor(event, 'Korean')}>Korean</button>
                                <button id='type' onClick={(event)=>this.onClickChangeColor(event, 'Japanese')}>Japanese</button>
                                <button id='type' onClick={(event)=>this.onClickChangeColor(event, 'Chinese')}>Chinese</button>
                                <button id='type' onClick={(event)=>this.onClickChangeColor(event, 'Mexican')}>Mexican</button>
                                <button id='type' onClick={(event)=>this.onClickChangeColor(event, 'Moroccan')}>Moroccan</button>
                            </div>
                        </div>
                        <div className = 'create_fourth'>
                            <p>총 예상 가격 :   </p>
                            <h3>계산된 가격</h3>
                            <p>{this.state.price} 원</p>
                        </div>
                        <div className = 'create_fifth'>
                            <button id='submit' onClick={() => this.submitHandler()}>Submit</button>                        </div>

                        <div className = 'footspace'><br/></div>
                        
                    </div>  
                </div>
            </div>   
        )
    }
}

const mapStateToProps = state => {
    return {
       
    };
}
  
const mapDispatchToProps = dispatch => {
    return {
        onCreate: (recipe) => dispatch(actionCreators.createRecipe(recipe)),

        }
    }

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(Createpage));

