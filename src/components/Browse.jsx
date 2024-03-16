// import Header from "./Header";
// import { useSelector } from "react-redux";

// const Browse = () => {

//   return (
//     <div>
//       <Header />

//     </div>
//   );
// };
// export default Browse;




import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { getRealtimeUsers, updateMessage, getRealtimeConversations } from '../../actions';
import Header from './Header';
import Layout from './Layout';

const User = () => {
  const { user, onClick } = props;

  return (
    <div onClick={() => onClick(user)} className="flex items-center p-2 cursor-pointer">
      <div className="w-12 h-12 rounded-full overflow-hidden">
        <img src="https://i.pinimg.com/originals/be/ac/96/beac96b8e13d2198fd4bb1d5ef56cdcf.jpg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex justify-between items-center mx-4">
        <span className="font-semibold">{user.firstName} {user.lastName}</span>
        <span className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      </div>
    </div>
  );
}

const Browse = (props) => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const user = useSelector(state => state.user);
  const [chatStarted, setChatStarted] = useState(false);
  const [chatUser, setChatUser] = useState('');
  const [message, setMessage] = useState('');
  const [userUid, setUserUid] = useState(null);
  let unsubscribe;

  // useEffect(() => {
  //   unsubscribe = dispatch(getRealtimeUsers(auth.uid))
  //     .then(unsubscribe => unsubscribe)
  //     .catch(error => console.log(error));
  // }, []);

  useEffect(() => {
    return () => {
      unsubscribe.then(f => f()).catch(error => console.log(error));
    }
  }, []);

  const initChat = (user) => {
    setChatStarted(true)
    setChatUser(`${user.firstName} ${user.lastName}`)
    setUserUid(user.uid);
    dispatch(getRealtimeConversations({ uid_1: auth.uid, uid_2: user.uid }));
  }

  const submitMessage = (e) => {
    const msgObj = {
      user_uid_1: auth.uid,
      user_uid_2: userUid,
      message
    }

    if (message !== "") {
      dispatch(updateMessage(msgObj))
        .then(() => {
          setMessage('')
        });
    }
  }

  return (
    <>
    <Header/>
    
      <section className="container flex">
        <div className="w-1/3 h-full overflow-y-auto border-r border-gray-300">
          {/* {user.users.length > 0 ?
            user.users.map(user => <User onClick={initChat} key={user.uid} user={user} />)
            : null} */}
        </div>
        <div className="w-2/3 h-full relative">
          <div className="chatHeader bg-gray-200 text-center font-bold absolute w-full top-0 h-10 flex items-center justify-center">
            {chatStarted ? chatUser : ''}
          </div>
          <div className="messageSections h-full overflow-y-auto mt-10">
            {chatStarted ?
              user.conversations.map(con =>
                <div key={con.id} className={`text-white rounded-lg p-2 ${con.user_uid_1 === auth.uid ? 'text-right bg-blue-500' : 'text-left bg-gray-500'}`}>
                  {con.message}
                </div>)
              : null}
          </div>
          {chatStarted ?
            <div className="chatControls absolute bottom-0 w-full flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write Message"
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none"
              />
              <button onClick={submitMessage} className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-lg">Send</button>
            </div>
            : null}
        </div>
      </section>
    </>
  );
}

export default Browse;
