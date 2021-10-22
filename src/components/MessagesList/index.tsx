import React, { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { io } from "socket.io-client";
import { api } from "../../services/api";

import { MESSAGES_EXAMPLE } from '../../../utils/messages';

import { Message, MessageProps } from "../Message";

import { styles } from "./styles";

let messagesQueoe: MessageProps[] = MESSAGES_EXAMPLE;

const socket = io(String(api.defaults.baseURL));
socket.on('new_message', (newMessage) => {
  messagesQueoe.push(newMessage);
})

export function MessagesList() {
  const [currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);
  
  useEffect(() => {
    async function fetchMessages(){
      const messagesResponse = await api.get<MessageProps[]>('messages/last3');
      setCurrentMessages(messagesResponse.data);
    }

    fetchMessages();
  },[])

  useEffect(() => {
    const timer = setInterval(() => {
      if(messagesQueoe.length > 0) {
        setCurrentMessages(prevState => [messagesQueoe[0], prevState[0], prevState[1]]);
        messagesQueoe.shift();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [])
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      { !!currentMessages && currentMessages.map(message => {
        return (
          <Message key={message.id} data={message}/>
        )
      })}
    </ScrollView>
  )
}