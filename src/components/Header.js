import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../utils/firebase";
import { addUser, removeUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { NETFLIX_LOGO, SUPPORTED_LANGUAGES, USER_AVATAR } from "../utils/constants";
import { setGptSearchView, toggleGptSearchView } from "../store/gptSlice";
import { changeLanguage } from "../store/configSlice";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
    const selectedMovieDetails = useSelector((store) => store.movies.selectedMovieDetails);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(store => store.user);
    const showGptSearch = useSelector(store => store.gpt.showGptSearch);
  

    const signoutHandler = () => {
      dispatch(setGptSearchView(false));
        signOut(auth).then(() => {
            dispatch(removeUser());
            navigate("/");
          }).catch((error) => {
             console.log(error.message);
          });
    }


    // intitially when this useEffect was inside body comonent we were able to /browse without login
    // But as we have put this in Header means each time header renders onAuthStateChange will be called and do not allow us to access browse without login    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const {uid, displayName, email, photoURL} = user;
            dispatch(addUser({
              uid: uid,
              displayName: displayName,
              email: email,
              photoURL: photoURL
            }));
    
            // due to this whenever a use logged in user will be redirect to /browse page
            // Still if we try to access the "/" route then also user will be redirect to the /browse page
            if(!selectedMovieDetails)
            navigate("/browse");
          } else {
            // dispatch(setGptSearchView(false));
            dispatch(removeUser());
            navigate("/");
          }
        });
       
        

        // Unsubscribe to the onAuthStateChange when ever we are not using Header(unmounting Header)
        // return () => unsubscribe();
      }, []);

      const handleShowGptSearch = () => {
        const gptSearchState = showGptSearch;
          dispatch(toggleGptSearchView());

          if(!gptSearchState){
            navigate("/gpt_search");
          }
          else{
            navigate("/browse");
          }
      }


      const changeLanguageHandler = (event) => {
        // console.log(event.target.value);
        dispatch(changeLanguage(event.target.value));
      }

      const goToHomePageHandler = () => {
        dispatch(setGptSearchView(false));
          if(user){
            navigate("/browse");
          }
          else{
            navigate("/");
          }
      }

      // console.log("Header");
    return (
        <div className="w-screen md:py-0 md:px-6 bg-black  bg-opacity-[70%] z-10 flex flex-col md:flex-row justify-between">
            <img 
                onClick={goToHomePageHandler}
                className="w-36 mx-auto md:mx-0 cursor-pointer"
                src={NETFLIX_LOGO}
                alt = "logo"
                />
            { user &&
                <div className="flex px-2 justify-between  md:m-0">
                    {
                      showGptSearch && 
                      <div className="flex">
                        <select 
                          onChange={changeLanguageHandler}
                          className="text-white bg-[rgb(51,51,51)] bg-opacity-60 h-8 px-2 mx-4 md:mx-6 rounded-md md:my-[14px] font-bold " >
                          {
                            SUPPORTED_LANGUAGES.map((lang) => (
                                <option 
                                  
                                  key={lang.identifier} 
                                  value={lang.identifier}>
                                  {lang.name}
                                </option>)
                              )
                          }
                        </select>
                      </div>
                    }
                    
                    <button
                      onClick={handleShowGptSearch}
                      className="text-white  h-8 px-2 mx-4 md:mx-2  rounded-md md:my-[14px] bg-opacity-90 font-bold hover:text-red-600">
                      GPT Search
                    </button>
                    <img
                        className="hidden md:block w-8 h-8 rounded-[100%] m-4"
                        alt="userIcon" src={USER_AVATAR} 
                    />
                    {/* <div className="hidden md:block w-8 h-8 rounded-[100%] m-4">
                      <FaUserCircle 

                      />
                    </div> */}
                    <button
                        onClick={signoutHandler}
                        className="text-white   h-8 px-2 mx-4 md:mx-2 rounded-md md:my-[15px] bg-opacity-90 font-bold hover:text-red-600">
                        Sign Out
                    </button>
                </div>
            }
        </div>
    )
}

export default Header;