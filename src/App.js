import React, { useEffect, useRef } from 'react';
import { getDatabase, ref, push, set, onChildAdded } from 'firebase/database';
import 'regenerator-runtime/runtime';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  getRedirectResult,
} from 'firebase/auth';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import { useState } from 'react';
import { motion } from 'framer-motion';

import Lottie, { animationData } from 'lottie-react';
import arrow from './arrow.json';
import Footer from './Footer';
import Header from './Header';
import img from './send.png';
import sound from './sound.mp3';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import './App.css';

function App() {
  const vRef = useRef(null);
  const msg = new SpeechSynthesisUtterance();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const db = getDatabase();
  const [Mic, setMic] = useState(false);
  const [user, setuser] = useState('');
  const [chats, setchats] = useState([]);
  const audioRef = useRef(null);
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  //beginning of functions

  const {
    transcript,
    listening,
    resetTranscript,
    finalTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const start = () => {
    SpeechRecognition.startListening(
      { continuous: true },
      { language: 'en-IN' }
    );
    console.log(transcript);
  };
  const stopMic = () => {
    SpeechRecognition.stopListening();
  };
  if (!browserSupportsSpeechRecognition) {
    console.error('Speech recognition is not supported in this browser.');
  }
  const googleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        const user = result.user;

        setuser({
          name: result.user.displayName,
          email: result.user.email,
        });
        console.log(token, user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
      });
  };

  const chatListRef = ref(db, 'chatss');
  const [messaged, setmessage] = useState('');

  const ApiSpeech = (message, message2) => {
    // msg.text = vRef.current.textContent;
    msg.text = message + 'has texted' + message2;

    console.log(msg.text);
    window.speechSynthesis.speak(msg);
  };
  //functions
  const call = () => {
    const newChatRef = push(chatListRef);
    set(newChatRef, {
      user,
      message: { messaged },
    });
    setmessage('');
  };
  const micCall = () => {
    setMic(!Mic);
    resetTranscript();

    setmessage('');

    start();
    console.log('message is ', transcript);

    // call();
  };
  const micOff = () => {
    setMic(!Mic);
    console.log('end', transcript);
    stopMic();
    setmessage(transcript);

    console.log('end of sound!!!!!!');
  };
  const updateHeight = () => {
    const element = document.getElementById('chat');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  };

  useEffect(() => {
    const chatListener = onChildAdded(chatListRef, (data) => {
      setchats((prevChats) => [...prevChats, data.val()]);
      console.log(data.val());
      setTimeout(() => {
        updateHeight();
      }, 100);

      if (!browserSupportsSpeechRecognition) {
        console.error('Speech recognition is not supported in this browser.');
      }

      playNotificationSound();
    });

    return () => {
      chatListener();
    };
  }, []);

  return (
    <div>
      <Header />
      <div className="container h-screen w-screen">
        {user.name ? (
          <div>
            <div className="title flex justify-center items-center">
              <h1>
                <span className="font-mono text-gray-700"> Welcome </span>
                {user.name}
              </h1>
            </div>

            <div className="chats" id="chat">
              {chats.map((t, index) => {
                return (
                  <div
                    key={index}
                    className={`container ${
                      t.user.email === user.email ? 'sender' : 'reciever'
                    }`}
                  >
                    <div
                      className="text relative"
                      ref={vRef}
                      onClick={() => ApiSpeech(t.user.name, t.message.messaged)}
                    >
                      {/* <select
                        className="h-3 absolute w-3 right-0 top-0 mt-3"
                        onChange={(event) => {
                          const selectedOption = event.target.value;
                          if (selectedOption === 'read') {
                            ApiSpeech(`${t.user.name}: ${t.message.messaged}`);
                          }
                        }}
                      >
                        <option value="default">Select an action</option>
                        <option value="read">Read The message</option>
                      </select> */}
                      <p>
                        <strong>{t.user.name}</strong> : {t.message.messaged}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* </div> */}
            <div>
              <div className="chatbox">
                <div>
                  <input
                    placeholder="Type Here ..."
                    onChange={(e) => setmessage(e.target.value)}
                    value={messaged}
                  />
                </div>
                {Mic ? (
                  <div className="mic">
                    <MicTwoToneIcon fontSize="large" onClick={micCall} />
                  </div>
                ) : (
                  <div className="mic" onClick={micOff}>
                    <MicOffTwoToneIcon fontSize="large" />
                  </div>
                )}
                {/* <div className="mic">
                  <MicTwoToneIcon fontSize="large" />
                </div> */}
                <div>
                  <button onClick={call}>
                    <img src={img} />
                  </button>
                  <audio ref={audioRef} src={sound} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="login flex justify-center items-center w-full h-70">
              <button
                className="text-white rounded-md p-4 bg-black font-extrabold mt-40"
                onClick={(e) => {
                  googleLogin();
                }}
              >
                SIGN IN
              </button>
            </div>
            <motion.div
              className="signin font-semibold from-stone-800 mt-[-200px]"
              animate={{
                scale: [1, 1.2, 1],
                // opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <p>
                <Lottie animationData={arrow} className="h-14 mb-9"></Lottie>
                <h1>Please SIGN IN</h1>
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
