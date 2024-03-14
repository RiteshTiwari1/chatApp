import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { addUser, removeUser } from "../utils/userSlice";
import { doc, setDoc, updateDoc } from "firebase/firestore";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  const handleSignOut = () => {
    const docRef = user.docRef;
    if (docRef) {
      updateDoc(doc(db,"users",docRef), {
        isOnline: false,
      })
        .then(() => {
          signOut(auth)
            .then(() => {
              console.log("User signed out successfully");
              dispatch(removeUser());
              localStorage.removeItem("user");
            })
            .catch((error) => {
              console.error("Error signing out:", error);
            });
        })
        .catch((error) => {
          console.error("Error updating user document:", error);
        });
    } else {
      console.error("No document reference found in Redux store.");
    }
  };
  
  useEffect(() => {
    

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const storedUsers = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const { uid, email, displayName} = user;
        const userData = { uid, email, displayName };

        // Check if storedUsers is truthy before accessing its properties

        // console.log(storedUsers);
        // console.log(userData);
        if (storedUsers && storedUsers.docRef) {
          userData.docRef = storedUsers.docRef;
        }
        
        dispatch(addUser(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/browse");
      } else {
        dispatch(removeUser());
        localStorage.removeItem("user"); // Remove user data from local storage when user signs out
        navigate("/");
      }
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">Chat App</div>
      {user && (
        <button
          onClick={handleSignOut}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

export default Header;
