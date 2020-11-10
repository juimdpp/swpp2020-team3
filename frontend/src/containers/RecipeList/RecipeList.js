import React, {Component} from 'react';
import Recipe from '../../components/Recipe/Recipe';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import * as actionCreators from '../../store/actions/index';
import queryString from 'query-string';
import './RecipeList.css'
//TODO:
//      중간 이후에 할 일 : like/unlike recipe User model, authentication?
//      query string doesn't work...
class RecipeList extends Component{

    state = {
        category1: true,
        category2: true,
        category3: true,
        category4: true,
        category5: true,
        category6: true,

        minPrice : 0,
        maxPrice : Number.MAX_SAFE_INTEGER,
        minDuration : 0,
        maxDuration : Number.MAX_SAFE_INTEGER,
        searchWord : "",

        pageStart : 0,
        pageNumber: 1,
        searchMode : "likes",
        searchOptionsClicked : false,
    }


    
    componentDidMount() {
        
        const {search} = this.props.location;
        let query = this.state;
        if(search){
            query = queryString.parse(search);
            this.setState(query);
        }
        // changed state doen't applied...
        this.props.onGetRecipes(query);
    }
    
    componentDidUpdate(prevProps, prevState){
        
        if(prevState){
            if(this.state.pageStart !== prevState.pageStart){
                const {search} = this.props.location;
                let query = this.state;
                if(search){
                    query = queryString.parse(search);
                    this.setState(query);
                }
                this.props.onGetRecipes(query);
            }
        }
            
    }
    
    clickSearchModeHandler = searchmode => {
        this.setState({searchMode: searchmode});
        this.setState({searchOptionsClicked: false});
    }

    clickCategoryHandler = (event,id) => {
        if(id == 1) this.setState({category1 : !this.state.category1});
        else if(id == 2) this.setState({category2 : !this.state.category2});
        else if(id == 3) this.setState({category3 : !this.state.category3});
        else if(id == 4) this.setState({category4 : !this.state.category4});
        else if(id == 5) this.setState({category5 : !this.state.category5});
        else this.setState({category6 : !this.state.category6});
    }

    checkInputHandler = () =>{
        if(this.state.maxPrice === '') this.setState({maxPrice: Number.MAX_SAFE_INTEGER});
        if(this.state.minPrice === '') this.setState({minPrice: 0});
        if(this.state.maxDuration === '') this.setState({maxDuration: Number.MAX_SAFE_INTEGER});
        if(this.state.minDuration === '') this.setState({minDuration: 0});
    }

    clickOptionsHandler = () => {
        this.setState({searchOptionsClicked: !(this.state.searchOptionsClicked)});
    }

    clickRecipeHandler = id => {
        this.props.history.push('/recipe/'+id);
    }

    clickSearchHandler = () => {
        this.checkInputHandler();
        this.props.history.push(`/search?category1=${this.state.category1}&category2=${this.state.category2}&category3=${this.state.category3}&category4=${this.state.category4}&category5=${this.state.category5}&category6=${this.state.category6}&minPrice=${this.state.minPrice}&maxPrice=${this.state.maxPrice}&minDuration=${this.state.minDuration}&maxDuration=${this.state.minDuration}&searchWord=${this.state.searchWord}&pageStart=${this.state.pageStart}&pageNumber=${this.state.pageNumber}&searchMode=${this.state.searchMode}&searchOptionsClicked=false`);
        this.props.onGetRecipes(this.state);
    }

    clickPagePreviousHandler = () => {
        this.setState({pageStart: this.state.pageStart-5});
        this.setState({pageNumber: this.state.pageStart-4});
    }

    clickPageNumberHandler = (id) => {
        this.setState({pageNumber: this.state.pageStart+id});
    }

    clickPageNextHandler = () => {
        this.setState({pageStart: this.state.pageStart+5});
        this.setState({pageNumber: this.state.pageStart+6});
    }


    render(){
        console.log(this.props.storedRecipes)
        let slicedRecipes;
        if(this.state.pageNumber%5 === 0)
            slicedRecipes = this.props.storedRecipes.slice(10*(this.state.pageNumber%5-1), 10*5);
        else
            slicedRecipes = this.props.storedRecipes.slice(10*(this.state.pageNumber%5-1), 10*(this.state.pageNumber%5));
        const recipes = slicedRecipes.map((recipe) => {
            return (
                <Recipe
                    author={recipe.author__username}
                    thumbnail={'data:image/png;base64,'+recipe.thumbnail}
                    title={recipe.title}
                    rating={recipe.rating}
                    cost={recipe.price}
                    likes={recipe.likes}
                    clickedRecipe={() => this.clickRecipeHandler(recipe.id)}
                    clickedLikes={null}
                />
            );
        });
        return(
            <div className = "RecipeList">
                <div className = "category-search">
                    <div className = "categories">
                        <div className = "row">
                            <button className="category-select-button" style = {{backgroundColor: this.state.category1 ? "grey" : null}}
                                onClick={(event) => this.clickCategoryHandler(event,1)}>양식</button>
                            <button className="category-select-button" style = {{backgroundColor: this.state.category2 ? "grey" : null}}
                                onClick={(event) => this.clickCategoryHandler(event,2)}>한식</button>
                            <button className="category-select-button" style = {{backgroundColor: this.state.category3 ? "grey" : null}}
                                onClick={(event) => this.clickCategoryHandler(event,3)}>중식</button>
                        </div>
                        <div className = "row">
                            <button className="category-select-button" style = {{backgroundColor: this.state.category4 ? "grey" : null}}
                                onClick={(event) => this.clickCategoryHandler(event,4)}>일식</button>
                            <button className="category-select-button" style = {{backgroundColor: this.state.category5 ? "grey" : null}}
                            onClick={(event) => this.clickCategoryHandler(event,5)}>인스턴트</button>
                            <button className="category-select-button" style = {{backgroundColor: this.state.category6 ? "grey" : null}}
                            onClick={(event) => this.clickCategoryHandler(event,6)}>최저가</button>
                        </div>
                    <div className = "constraints">
                        <div className = "cost">
                            <p>Price(won)</p>
                            <input className = "min-cost-input" placeholder = "하한" value = {this.state.minPrice} 
                                   onChange={(event) => this.setState({minPrice: event.target.value})}></input>
                            <input className = "max-cost-input" placeholder = "상한" value = {this.state.maxPrice} 
                                   onChange={(event) => this.setState({maxPrice: event.target.value})}></input>
                        </div>
                        <div className = "time">
                            <p>Duration(min)</p>
                            <input className = "min-time-input" placeholder = "하한" value = {this.state.minDuration} 
                                   onChange={(event) => this.setState({minDuration: event.target.value})}></input>
                            <input className = "max-time-input" placeholder = "상한" value = {this.state.maxDuration} 
                                   onChange={(event) => this.setState({maxDuration: event.target.value})}></input>
                        </div>
                        <div className = "keywords">
                            <p>Keywords</p>
                            <input className = "search-word-input" placeholder = "키워드" value = {this.state.searchWord} 
                                   onChange={(event) => this.setState({searchWord: event.target.value})}></input>
                        </div>
                    </div>
                    <div className = "search-options" id = "list-option">
                        <div id = "option_label"> 분류 </div>
                            <div className = "options">
                                <button className ="search-options-button" onClick={() => this.clickOptionsHandler()}>sorted by</button>
                                {this.state.searchOptionsClicked && <button className ="search-mode-select-button"
                                        onClick={() => this.clickSearchModeHandler("relevance")}>relevance</button>}
                                {this.state.searchOptionsClicked && <button className ="search-mode-select-button"
                                        onClick={() => this.clickSearchModeHandler("likes")}>likes</button>}
                                {this.state.searchOptionsClicked && <button className ="search-mode-select-button"
                                        onClick={() => this.clickSearchModeHandler("uploaded date")}>most recent</button>}
                                {this.state.searchOptionsClicked && <button className ="search-mode-select-button"
                                        onClick={() => this.clickSearchModeHandler("rating")}>rating</button>}
                                {this.state.searchOptionsClicked && <button className ="search-mode-select-button"
                                        onClick={() => this.clickSearchModeHandler("cost")}>cost</button>}
                            </div>
                            <div className = "search">
                                <button className = "search-confirm-button" onClick={() => this.clickSearchHandler()}>search</button>
                            </div>
                        </div>
                    </div>
                    <div className = "recipes">
                        {recipes}
                    </div>
                    <div className = "pages">
                        <div className = "page">
                            <p>Page</p>
                        </div>
                        <div className = "row">
                        {this.props.storedRecipes.length >= 1 && <button className="list-page-previous-button"
                                disabled ={this.state.pageStart == 0} onClick={() => this.clickPagePreviousHandler()}>left</button>}
                        {this.props.storedRecipes.length >= 1 && <button className="list-page-number-button"
                                style = {{backgroundColor: this.state.pageNumber%5==1 ? "grey" : null}}
                                onClick={() => this.clickPageNumberHandler(1)}>{this.state.pageStart+1}</button>}
                        {this.props.storedRecipes.length >= 11 && <button className="list-page-number-button"
                                style = {{backgroundColor: this.state.pageNumber%5==2 ? "grey" : null}}
                                onClick={() => this.clickPageNumberHandler()}>{this.state.pageStart+2}</button>}
                        {this.props.storedRecipes.length >= 21 && <button className="list-page-number-button"
                                style = {{backgroundColor: this.state.pageNumber%5==3 ? "grey" : null}}
                                onClick={() => this.clickPageNumberHandler()}>{this.state.pageStart+3}</button>}
                        {this.props.storedRecipes.length >= 31 && <button className="list-page-number-button"
                                style = {{backgroundColor: this.state.pageNumber%5==4 ? "grey" : null}}
                                onClick={() => this.clickPageNumberHandler(4)}>{this.state.pageStart+4}</button>}
                        {this.props.storedRecipes.length >= 41 && <button className="list-page-number-button"
                                style = {{backgroundColor: this.state.pageNumber%5==0 ? "grey" : null}}
                                onClick={() => this.clickPageNumberHandler(5)}>{this.state.pageStart+5}</button>}
                        {this.props.storedRecipes.length >= 51 && <button className="list-page-next-button"
                                disabled={false} onClick={() => this.clickPageNextHandler()}>right</button>}
                    </div>
                    </div>
                </div>
            </div>

        )        
    }
};


const mapStateToProps = state => {
    return {
        storedRecipes: state.rcp.recipes,
    };
}
  
const mapDispatchToProps = dispatch => {
    return {
        onGetRecipes: (searchSettings) =>
            dispatch(actionCreators.getRecipes(searchSettings)),
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(withRouter(RecipeList));