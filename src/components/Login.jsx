// import React, { useRef, useState } from 'react';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth } from '../utils/firebase';
// import { useDispatch } from 'react-redux';
// import { addUser } from '../utils/userSlice';
// import { checkValidate } from '../utils/validate';
// import Header from './Header';

// const Login = () => {
//     const [isSignInForm, setIsSignInForm] = useState(true);
//     const [errorMessage, setErrorMessage] = useState(null);
//     const email = useRef(null);
//     const password = useRef(null);
//     const name = useRef(null);
//     const dispatch = useDispatch();

//     const toggleSignInForm = () => {
//         setIsSignInForm(!isSignInForm);
//     };

//     const handleButtonClick = () => {
//         const message = checkValidate(email.current.value, password.current.value);
//         setErrorMessage(message);

//         if (message) return;

//         if (!isSignInForm) {
//             createUserWithEmailAndPassword(auth, email.current.value, password.current.value)
//                 .then((userCredential) => {
//                     const user = userCredential.user;
//                     updateProfile(user, {
//                         displayName: name.current.value,
//                     }).then(() => {

                        
//                         const { uid, email, displayName } = user; // Use the user object returned from createUserWithEmailAndPassword
//                         dispatch(addUser({ uid: uid, email: email, displayName: displayName }));
//                     }).catch((error) => {
//                         setErrorMessage(error.message);
//                     });
//                 })
//                 .catch((error) => {
//                     const errorCode = error.code;
//                     const errorMessage = error.message;
//                     setErrorMessage(errorCode + " " + errorMessage);
//                 });
//         } else {
//             signInWithEmailAndPassword(auth, email.current.value, password.current.value)
//                 .then((userCredential) => {
//                     const user = userCredential.user;
//                 })
//                 .catch((error) => {
//                     const errorCode = error.code;
//                     const errorMessage = error.message;
//                     setErrorMessage(errorCode + " " + errorMessage);
//                 });
//         }
//     };

//     return (
//         <>
//         <Header/>
//         <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            
//             <div className="w-full max-w-sm">
//                 <form onSubmit={(e) => e.preventDefault()} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//                     <h1 className="font-bold text-3xl mb-4">{isSignInForm ? "Sign In" : "Sign Up"}</h1>
//                     {!isSignInForm &&
//                         <input ref={name} type="text" placeholder="Full Name" className="p-2 mb-4 w-full border rounded-md" />
//                     }
//                     <input ref={email} type="text" placeholder="Email Address" className="p-2 mb-4 w-full border rounded-md" />
//                     <input ref={password} type="password" placeholder="Password" className="p-2 mb-4 w-full border rounded-md" />
//                     <p className="text-red-500 font-bold text-lg mb-4">{errorMessage}</p>
//                     <button className="p-4 bg-red-700 text-white w-full rounded-lg mb-4" onClick={handleButtonClick}>
//                         {isSignInForm ? "Sign In" : "Sign Up"}
//                     </button>
//                     <p className="text-gray-600 cursor-pointer" onClick={toggleSignInForm}>
//                         {isSignInForm ? "New to Netflix? Signup Now" : "Already Registered? Sign In Now"}
//                     </p>
//                 </form>
//             </div>
//         </div>
//         </>
//     );
// };

// export default Login;






import React, { useRef, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../utils/firebase'; // Assuming db is your Firestore database instance
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { checkValidate } from '../utils/validate';
import { collection, addDoc, query, where,getDocs, updateDoc, doc } from "firebase/firestore"; 

import Header from './Header';
import { current } from '@reduxjs/toolkit';

const Login = () => {
    const [isSignInForm, setIsSignInForm] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const nameRef = useRef(null);
    const dispatch = useDispatch();

    const toggleSignInForm = () => {
        setIsSignInForm(!isSignInForm);
    };
    
    const getUserByEmail = async (email) => {

        // console.log(email);
        const usersRef = collection(db, 'users');
        // console.log(usersRef);
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot);
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const docRef = querySnapshot.docs[0].id;
            
            return { ...userData, docRef }; // Include document reference in the returned user data
        } else {
            throw new Error('User not found');
        }
    };
    
    const handleButtonClick = () => {
        const message = checkValidate(emailRef.current.value, passwordRef.current.value);
        setErrorMessage(message);
    
        const name = nameRef.current ? nameRef.current.value : "";
        const email = emailRef.current ? emailRef.current.value : "";
        const password = passwordRef.current ? passwordRef.current.value : "";
    
        if (message) return;
    
        if (!isSignInForm) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    updateProfile(user, {
                        displayName: name,
                    }).then(() => {
                        console.log("User profile updated successfully");
                        console.log("Adding user data to Firestore...");
                        addDoc(collection(db, "users"), {
                            displayName: name,
                            email: email,
                            password: password,
                            uid: user.uid,
                            createdAt: new Date(),
                            isOnline: true
                        }).then((docRef) => { // Get the document reference
                            console.log("User data added to Firestore successfully");
                            console.log("Document reference:", docRef.id);
    
                            const loggedInUser = {
                                uid: user.uid,
                                email: user.email,
                                displayName: name,
                                docRef: docRef.id // Store the document reference in the loggedInUser object
                            }
                            console.log(loggedInUser);
                            dispatch(addUser(loggedInUser));
                            localStorage.setItem('user', JSON.stringify(loggedInUser));
                            
                        }).catch((error) => {
                            console.error("Error adding user data to Firestore:", error);
                            setErrorMessage(error.message);
                        });
                    }).catch((error) => {
                        console.error("Error updating user profile:", error);
                        setErrorMessage(error.message);
                    });
                }).catch((error) => {
                    console.error("Error creating user:", error);
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    setErrorMessage(errorCode + " " + errorMessage);
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User signed in successfully");
                console.log(user);
                // Fetch user details from Firestore based on email
                getUserByEmail(email)
                    .then((userData) => {
                        console.log(userData);
                        const loggedInUser = {
                            uid: user.uid,
                            email: user.email,
                            displayName: userData.displayName,
                            docRef: userData.docRef
                        };
                        console.log(loggedInUser);
                        // Update user's online status in Firestore
                        updateDoc(doc(db, "users", userData.docRef), { isOnline: true })
                            .then(() => {
                                console.log("User's online status updated successfully");
                                dispatch(addUser(loggedInUser));
                                localStorage.setItem('user', JSON.stringify(loggedInUser));
                            })
                            .catch((error) => {
                                console.error("Error updating user's online status:", error);
                                setErrorMessage(error.message);
                            });
                    })
                    .catch((error) => {
                        console.error("Error fetching user details from Firestore:", error);
                        setErrorMessage(error.message);
                    });
            })
            .catch((error) => {
                console.error("Error signing in:", error);
                setErrorMessage(error.message);
            });
        }
    };
    
    return (
        <>
            <Header/>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
                
                <div className="w-full max-w-sm">
                    <form onSubmit={(e) => e.preventDefault()} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <h1 className="font-bold text-3xl mb-4">{isSignInForm ? "Sign In" : "Sign Up"}</h1>
                        {!isSignInForm &&
                            <input ref={nameRef} type="text" placeholder="Full Name" className="p-2 mb-4 w-full border rounded-md" />
                        }
                        
                        <input ref={emailRef} type="text" placeholder="Email Address" className="p-2 mb-4 w-full border rounded-md" />
                        <input ref={passwordRef} type="password" placeholder="Password" className="p-2 mb-4 w-full border rounded-md" />

                        <p className="text-red-500 font-bold text-lg mb-4">{errorMessage}</p>
                        <button className="p-4 bg-red-700 text-white w-full rounded-lg mb-4" onClick={handleButtonClick}>
                            {isSignInForm ? "Sign In" : "Sign Up"}
                        </button>
                        <p className="text-gray-600 cursor-pointer" onClick={toggleSignInForm}>
                            {isSignInForm ? "New to Netflix? Signup Now" : "Already Registered? Sign In Now"}
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
