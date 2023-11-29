import { useDispatch, useSelector } from "react-redux";
import lang from "../../utils/languageConstants";
import { useRef, useState } from "react";
import openai from "../../utils/openAI";
import { addGptMoviesRsult, setCallCount } from "../../store/gptSlice";
import { API_OPTIONS } from "../../utils/constants";
import CircleRating from "../movieDetails/CircleRating";


const GptSearchBar = () => {
    const callCount = useSelector((store) => store.gpt.callCount);

    const [isFirstCall, setIsFirstCall] = useState(false);
    const dispatch = useDispatch();
    const searchText = useRef(null);
    const langKey = useSelector(store => store.config.lang);
    
    const searchMovieTMDB = async (movie) => {
        const movieData = await fetch('https://api.themoviedb.org/3/search/movie?query='+movie+'&include_adult=false&language=en-US&page=1', API_OPTIONS);

        const jsonData = await movieData.json();
        // console.log("jsonData",jsonData);
        return jsonData;
    }



    const gptSearchHandler = async () => {
        if(callCount <= 0) return;
        
        dispatch(setCallCount(callCount - 1));
        console.log("callCount: ", callCount);
        console.log(searchText.current.value);

        
        const prompt = "Act as a Movie Recommendation System and suggest some movies for the query: " +
            searchText.current.value +
            ". Only give me the names of 5 movies, comma separated like the example ahead. Example Result: Krish, URI, Mission Mangal, Koi Mil Gya, War";
       
        console.log(isFirstCall);
        // if(isFirstCall) return;

        // setIsFirstCall(true);
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
          });

        
          console.log(chatCompletion);
          if(!chatCompletion.choices){
            throw new Error("Unable to get response from GPT");
          }
        
          // The result will be Koi Mil Gya, Andaz Apna Apna, Gadar
          // so creating array of movies from that
          const gptMovies = chatCompletion.choices?.[0]?.message?.content.split(",");
          console.log("gptMovies:", gptMovies);
          //getting the movieData of gptMovies

          const data =  gptMovies.map((movie) => searchMovieTMDB(movie));

        //    The data will contains unresolved Promises for each call not the movie data
        //    we to resolve the data explicitly using Promise.all();

          const moviesResult = await Promise.all(data);

           console.log(moviesResult);

          dispatch(addGptMoviesRsult({gptMoviesName: gptMovies, tmdbMoviesResult: moviesResult}));


    }
    return (
        <div className="pt-8 flex flex-col justify-center items-center">
            <div
                className="text-gray-300 bg-black  p-[14px] m-4 rounded-md text-center font-bold text-lg"
            >
                <div 
                    className="bg-[rgb(51,51,51)] rounded text-center p-[6px] px-4"
                >
                   {
                        callCount > 0 ? 
                        (
                            <>
                                Credits: 
                                <span className={`${callCount <= 2 ? "text-red-600" : callCount <= 3 ? "text-orange-600" : "text-green-600"} pl-2`}
                                >
                                 {callCount}
                                </span> 
                            </>
                        ) : (
                            <span className="text-red-600 text-xl">Limit Exhausted!</span>
                            
                        )
                    }     
                </div>
            </div>
            <div className="flex justify-center md:w-[1300px] w-[95%]">
                <form 
                    onSubmit={(e) => e.preventDefault()}
                    className="w-full md:w-1/2 bg-black grid grid-cols-12 rounded-md md:min-w-[500px] mx-4 md:mx-0 text-sm md:text-[16px]">
                    <input 
                        ref={searchText}
                        type="text" 
                        placeholder={lang[langKey].placeholder} 
                        className="p-2 md:p-4 m-4 col-span-9 rounded-md bg-[rgb(51,51,51)] text-white"    
                        />
                    <button
                        onClick={gptSearchHandler}
                        className="col-span-3 m-4  text-gray-300 font-bold  bg-gradient-to-b from-red-600 to-[rgb(43,25,25)] bg-opacity-80 rounded-md"
                    >
                        {lang[langKey].search}
                    </button>
                </form>
            
            </div>
        </div>
    );
}

export default GptSearchBar;